'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address.')
})

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const email = formData.get('email')

  const parsed = subscribeSchema.safeParse({ email })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false }
  }

  try {
    const supabase = await createClient()
    
    // Check if the email already exists
    const { data: existingSub } = await supabase
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', parsed.data.email)
      .maybeSingle()

    if (existingSub) {
      if (existingSub.subscribed) {
        return { error: 'You are already subscribed!', success: false }
      } else {
        // They were unsubscribed, resubscribe them
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ subscribed: true })
          .eq('email', parsed.data.email)

        if (updateError) throw updateError
        return { error: null, success: true }
      }
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: parsed.data.email,
        subscribed: true
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return { error: 'You are already subscribed!', success: false }
      }
      throw insertError
    }

    // Attempt to sync with user settings if the logged-in user matches the email
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === parsed.data.email) {
      const currentSettings = user.user_metadata?.settings || {}
      await supabase.auth.updateUser({
        data: {
          settings: { ...currentSettings, email_notifications: true }
        }
      })
    }

    return { error: null, success: true }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    // If the table doesn't exist yet, we show a helpful error
    if (error?.code === 'PGRST205' || error?.code === '42P01') {
       return { error: 'Database table not found. Please run the setup script.', success: false }
    }
    return { error: 'An unexpected error occurred.', success: false }
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  const parsed = subscribeSchema.safeParse({ email })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false }
  }

  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false })
      .eq('email', parsed.data.email)

    if (error) throw error

    return { error: null, success: true }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return { error: 'An unexpected error occurred.', success: false }
  }
}

export async function getNewsletterStatus() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return { isLoggedIn: false, isSubscribed: false, email: null }
    }

    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('subscribed')
      .eq('email', user.email)
      .maybeSingle()

    return { 
      isLoggedIn: true, 
      isSubscribed: data?.subscribed ?? false,
      email: user.email
    }
  } catch (error) {
    console.error('Error fetching newsletter status:', error)
    return { isLoggedIn: false, isSubscribed: false, email: null }
  }
}
