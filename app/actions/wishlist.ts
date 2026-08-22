'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('AUTH_REQUIRED')
  }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('customer_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    return false // Removed
  } else {
    await supabase.from('wishlists').insert({ customer_id: user.id, product_id: productId })
    return true // Added
  }
}

export async function getWishlistStatus(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('customer_id', user.id)
    .eq('product_id', productId)
    .single()

  return !!existing
}

export async function getUserWishlistIds() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('customer_id', user.id)

  return data ? data.map(w => w.product_id) : []
}

export async function getWishlistProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      products (
        id, title, price, compare_at_price, brand, status,
        product_images ( url, sort_order ),
        reviews ( rating ),
        stores ( name, slug, status )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // Filter out products that were deleted or not active
  return data
    .map(w => w.products)
    .filter((p: any) => p && p.status === 'active' && p.stores?.status === 'approved')
}
