'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'platform_admin' && user.user_metadata?.role !== 'platform_admin') {
    throw new Error('Unauthorized')
  }
  return supabase
}

export async function createCategory(formData: FormData) {
  const supabase = await checkAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  const { error } = await supabase.from('categories').insert({ name, slug })
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await checkAdmin()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
}
