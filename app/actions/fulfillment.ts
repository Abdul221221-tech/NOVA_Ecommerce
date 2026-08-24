'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderFulfillment(orderId: string, status: string, trackingNumber?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify seller owns the order's store
  const { data: order } = await supabase
    .from('orders')
    .select('store_id, customer_id')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('Order not found')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const isSeller = store && store.id === order.store_id
  const isCustomer = user.id === order.customer_id
  
  if (!isSeller && !isCustomer) throw new Error('Unauthorized')

  // Only customers can dispute, only sellers can update tracking/shipping
  if (status === 'disputed' && !isCustomer) throw new Error('Only customers can dispute')
  if (['shipped', 'delivered'].includes(status) && !isSeller) throw new Error('Only sellers can fulfill')

  const updateData: any = { status }
  if (trackingNumber !== undefined && isSeller) {
    updateData.tracking_number = trackingNumber
  }

  const { error } = await supabase.from('orders').update(updateData).eq('id', orderId)
  
  if (error) throw new Error(error.message)
  
  // Notify the other party
  try {
    const { createNotification } = await import('@/app/actions/notifications');
    const recipientId = isSeller ? order.customer_id : user.id; // Customer receives fulfillment updates, Admin/Seller receives dispute
    const verb = status === 'shipped' ? 'shipped' : status === 'delivered' ? 'delivered' : status;
    
    // Do not notify self
    if (recipientId !== user.id) {
       await createNotification(recipientId, {
         title: `Order ${verb.charAt(0).toUpperCase() + verb.slice(1)}`,
         message: `Your order status has been updated to: ${verb}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
         type: 'order',
         related_id: orderId,
         icon: 'Package',
         href: `/account/orders/${orderId}` // Link specifically for customer
       });
    }
  } catch (err) {
    console.error('Failed to notify order status change', err);
  }

  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath(`/seller/orders/${orderId}`)
  revalidatePath('/account')
  revalidatePath('/seller/orders')
  return true
}

export async function sendMessage(orderId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('messages').insert({
    order_id: orderId,
    sender_id: user.id,
    body
  })

  if (error) throw new Error(error.message)
  return true
}
