import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileBackground } from '@/components/storefront/ProfileBackground'
import { SettingsForm } from '@/components/storefront/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup?redirect=/account/settings')
  }

  // Fetch the user's settings from metadata
  const settings = user.user_metadata?.settings || {}

  return (
    <div className="relative min-h-[calc(100vh-200px)] overflow-x-hidden">
      <ProfileBackground />

      <div className="w-full">
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Customize your preferences, privacy, and appearance.</p>
        </div>

        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  )
}
