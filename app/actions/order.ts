'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify the order belongs to this seller's store
  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) throw new Error('Store not found')

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('store_id', store.id) // Security check

  if (error) throw new Error(error.message)
  
  revalidatePath('/seller/orders')
}
