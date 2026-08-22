'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function checkSlugAvailability(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('stores').select('id').eq('slug', slug).single()
  return !data // true if available, false if taken
}

export async function createStore(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const logoUrl = formData.get('logoUrl') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/seller/login')

  // Default to true unless explicitly set to 'false'
  const requireApproval = process.env.REQUIRE_SELLER_APPROVAL !== 'false'
  const status = requireApproval ? 'pending' : 'approved'

  // Use service role to bypass RLS which strictly requires role='seller' for INSERT
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { error } = await adminClient.from('stores').insert({
    owner_id: user.id,
    name,
    slug,
    description,
    logo_url: logoUrl,
    status
  })

  if (error) {
    throw new Error(error.message)
  }

  if (status === 'pending') {
    redirect('/seller/pending')
  } else {
    redirect('/seller')
  }
}
