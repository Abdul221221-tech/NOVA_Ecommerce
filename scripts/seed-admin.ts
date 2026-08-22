import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@novamarket.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SuperSecretAdmin123!'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function seedAdmin() {
  console.log('Seeding Platform Admin...')
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      role: 'platform_admin',
      name: 'Platform Administrator'
    }
  })

  if (error) {
    console.error('Error creating admin user:', error.message)
    process.exit(1)
  }

  console.log(`Successfully created admin user: ${data.user.email}`)
  
  // Ensure profile is correctly set just in case the trigger didn't fire with the right metadata
  const { error: profileError } = await supabase.from('profiles').update({ role: 'platform_admin' }).eq('id', data.user.id)
  
  if (profileError) {
    console.log('Note: Profile role update failed (maybe trigger already handled it or RLS blocked service role?). Error:', profileError.message)
  } else {
    console.log('Profile role confirmed as platform_admin.')
  }
}

seedAdmin()
