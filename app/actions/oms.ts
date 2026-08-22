'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Status updates with History logging
export async function updateOrderStatusWithHistory(orderId: string, status: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // We use an admin client to bypass RLS for updating orders if needed, 
  // but we should verify permissions first.
  const adminClient = await createClient()

  // First, verify if user is admin, seller for this order, or customer for this order
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  const { data: order } = await adminClient.from('orders').select('*').eq('id', orderId).single()
  if (!order) throw new Error('Order not found')

  const isCustomer = order.customer_id === user.id
  const isAdmin = profile?.role === 'admin'
  let isSeller = false
  if (!isCustomer && !isAdmin) {
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
    if (store && store.id === order.store_id) isSeller = true
  }

  if (!isCustomer && !isAdmin && !isSeller) throw new Error('Unauthorized to update this order')

  // Update status in orders table
  const { error: updateError } = await adminClient
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (updateError) throw new Error(updateError.message)

  // Insert into history
  await adminClient.from('order_status_history').insert({
    order_id: orderId,
    status: status,
    note: note || `Status changed to ${status}`,
    created_by: user.id
  })

  revalidatePath('/account/orders')
  revalidatePath('/seller/orders')
  revalidatePath('/platform-admin/orders')
  
  return { success: true }
}

export async function cancelOrder(orderId: string, reason: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Using an RPC call for atomic cancellation
  const { data, error } = await supabase.rpc('cancel_order_atomic', {
    p_order_id: orderId,
    p_user_id: user.id,
    p_reason: reason,
    p_note: note || ''
  })

  if (error) {
    console.error("Cancellation Error:", error)
    throw new Error(error.message || 'Unable to cancel the order. Please try again.')
  }

  revalidatePath('/account/orders')
  return { success: true }
}

export async function submitReturnRequest(orderId: string, orderItemId: string | null, reason: string, note?: string, images?: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const adminClient = await createClient()
  
  const { error } = await adminClient.from('return_requests').insert({
    order_id: orderId,
    order_item_id: orderItemId,
    user_id: user.id,
    reason,
    note,
    images,
    status: 'pending'
  })

  if (error) throw new Error(error.message)
  
  // Update order to return_requested
  
  // Get order items count
  const { data: items } = await adminClient.from('order_items').select('id').eq('order_id', orderId);
  const { data: returns } = await adminClient.from('return_requests').select('order_item_id').eq('order_id', orderId);
  
  // If returns length == items length, update order status
  if (items && returns && returns.length === items.length) {
    await updateOrderStatusWithHistory(orderId, 'return_requested', 'Return requested for all items.');
  }

  
  return { success: true }
}

export async function submitExchangeRequest(orderId: string, orderItemId: string | null, requestedVariantId: string, reason: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const adminClient = await createClient()
  
  const { error } = await adminClient.from('exchange_requests').insert({
    order_id: orderId,
    order_item_id: orderItemId,
    user_id: user.id,
    requested_variant_id: requestedVariantId,
    reason,
    note,
    status: 'pending'
  })

  if (error) throw new Error(error.message)

  
  // Get order items count
  const { data: items } = await adminClient.from('order_items').select('id').eq('order_id', orderId);
  const { data: exchanges } = await adminClient.from('exchange_requests').select('order_item_id').eq('order_id', orderId);
  
  if (items && exchanges && exchanges.length === items.length) {
    await updateOrderStatusWithHistory(orderId, 'exchange_requested', 'Exchange requested for all items.');
  }


  return { success: true }
}

export async function updateRefundStatus(refundId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  let isSeller = false
  if (!isAdmin) {
    const { data: refund } = await supabase.from('refunds').select('order_id').eq('id', refundId).single()
    if (refund) {
      const { data: order } = await supabase.from('orders').select('store_id').eq('id', refund.order_id).single()
      if (order) {
        const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
        if (store && store.id === order.store_id) isSeller = true
      }
    }
  }

  if (!isAdmin && !isSeller) throw new Error('Unauthorized')

  const updatePayload: any = { status }
  if (status === 'completed') {
    updatePayload.completed_at = new Date().toISOString()
  }

  const adminClient = await createClient()
  const { error } = await adminClient.from('refunds').update(updatePayload).eq('id', refundId)
  if (error) throw new Error(error.message)

  revalidatePath('/platform-admin/orders')
  revalidatePath('/seller/refunds')
  return { success: true }
}

export async function updateReturnExchangeStatus(type: 'return' | 'exchange', id: string, status: string, orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if admin or seller
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  
  const { data: order } = await supabase.from('orders').select('store_id').eq('id', orderId).single()
  let isSeller = false
  if (!isAdmin && order) {
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
    if (store && store.id === order.store_id) isSeller = true
  }

  if (!isAdmin && !isSeller) throw new Error('Unauthorized')

  const adminClient = await createClient()
  const table = type === 'return' ? 'return_requests' : 'exchange_requests'
  
  const { error } = await adminClient.from(table).update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  
  // Sync back to order status if we approved/rejected
  // Only update order status if ALL items in order have this status
  const { data: items } = await adminClient.from('order_items').select('id').eq('order_id', orderId);
  const { data: returns } = await adminClient.from('return_requests').select('status').eq('order_id', orderId);
  const { data: exchanges } = await adminClient.from('exchange_requests').select('status').eq('order_id', orderId);

  const allItemsReturned = items && returns && returns.length === items.length && returns.every(r => r.status === 'completed');
  
  if (type === 'return') {
    if (status === 'completed' && allItemsReturned) {
      await updateOrderStatusWithHistory(orderId, 'returned', 'All items returned.');
    }
  } else {
    // Only update order status to exchanged if ALL items are exchanged
    const allItemsExchanged = items && exchanges && exchanges.length === items.length && exchanges.every(e => e.status === 'completed');
    if (status === 'completed' && allItemsExchanged) {
      await updateOrderStatusWithHistory(orderId, 'exchanged', 'All items exchanged.');
    }
  }


  revalidatePath('/seller/orders')
  revalidatePath('/account/orders')
  return { success: true }
}
