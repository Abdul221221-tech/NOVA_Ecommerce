'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(settings: any): Promise<{ error?: string, success?: boolean }> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        settings: settings
      }
    })

    if (updateError) {
      console.error("Settings update error:", updateError)
      return { error: 'Failed to save settings' }
    }

    // Sync with newsletter_subscribers table
    if (typeof settings.email_notifications === 'boolean') {
      try {
        const { data: existingSub } = await supabase
          .from('newsletter_subscribers')
          .select('id')
          .eq('email', user.email)
          .single()
          
        if (existingSub) {
          await supabase
            .from('newsletter_subscribers')
            .update({ subscribed: settings.email_notifications })
            .eq('email', user.email)
        } else if (settings.email_notifications) {
          await supabase
            .from('newsletter_subscribers')
            .insert({ email: user.email, subscribed: true })
        }
      } catch (e) {
        console.error("Failed to sync newsletter subscription:", e)
      }
    }

    revalidatePath('/account/settings')
    return { success: true }
  } catch (err: any) {
    console.error("Unexpected error in updateSettings:", err)
    return { error: 'An unexpected error occurred' }
  }
}
