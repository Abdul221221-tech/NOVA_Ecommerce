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
    <div className="w-full">
      

      <div className="w-full relative z-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Manage your personal information, preferences, and shipping details.</p>
        </div>

        <ProfileForm initialData={profile || {}} initialAddress={defaultAddress} />
      </div>
    </div>
  )
}
