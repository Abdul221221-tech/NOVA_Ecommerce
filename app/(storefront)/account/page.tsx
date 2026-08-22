import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/storefront/ProfileForm'
import { ProfileBackground } from '@/components/storefront/ProfileBackground'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  // Fetch the user's profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch the user's default address (or first one)
  const { data: addresses } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)

  const defaultAddress = addresses && addresses.length > 0 ? addresses[0] : null

  return (
    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
      <ProfileBackground />

      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8 relative z-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Manage your personal information, preferences, and shipping details.</p>
        </div>

        <ProfileForm initialData={profile || {}} initialAddress={defaultAddress} />
      </div>
    </div>
  )
}
