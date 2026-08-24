'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Status updates with History logging
export async function updateOrderStatusWithHistory(orderId: string, status: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // We use an admin client to bypass RLS for updating orders if needed, 
  // but we should verify permissions first.
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

  // Notify the other party
  try {
    const { createNotification } = await import('@/app/actions/notifications');
    const recipientId = isSeller || isAdmin ? order.customer_id : null;
    
    // Only notify customer if seller/admin changed it, otherwise seller should be notified (omitted for brevity here as modifyOrderItems handles customer->seller)
    if (recipientId) {
       await createNotification(recipientId, {
         title: `Order Status Updated`,
         message: `Your order status has been updated to: ${status}.`,
         type: 'order',
         related_id: orderId,
         icon: 'Package',
         href: `/account/orders/${orderId}`
       });
    }
  } catch (err) {
    console.error('Failed to notify order status change', err);
  }

  revalidatePath('/account/orders')
  revalidatePath('/seller/orders')
  revalidatePath('/platform-admin/orders')
  
  return { success: true }
}

export type OrderModificationRequest = {
  action: 'cancel' | 'return' | 'exchange'
  items: { id: string, quantity: number, variantId?: string }[]
  reason: string
  note?: string
}

export async function modifyOrderItems(orderId: string, request: OrderModificationRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Fetch order
  const { data: order, error: orderError } = await adminClient.from('orders').select('*').eq('id', orderId).single()
  if (orderError || !order) throw new Error('Order not found')
  if (order.customer_id !== user.id) throw new Error('Unauthorized: Order does not belong to you')

  // Validation based on action
  if (request.action === 'cancel') {
    const invalidStatuses = ['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    if (invalidStatuses.includes(order.status)) {
      throw new Error(`Order cannot be cancelled at this stage (current status: ${order.status})`)
    }
  } else if (request.action === 'return' || request.action === 'exchange') {
    if (order.status !== 'delivered') {
      throw new Error(`Order must be delivered to request a return or exchange.`)
    }
  }

  // 2. Fetch all order items
  const { data: allItems } = await adminClient.from('order_items').select('*').eq('order_id', orderId)
  if (!allItems) throw new Error('No items found in this order')

  // 3. Find previously cancelled/returned quantities
  const { data: previousCancellations } = await adminClient.from('cancellation_requests').select('note').eq('order_id', orderId)
  const { data: previousReturns } = await adminClient.from('return_requests').select('note').eq('order_id', orderId)
  
  let inactiveQuantities: Record<string, number> = {}

  const parseNotes = (records: any[]) => {
    if (!records) return
    records.forEach(r => {
      try {
        const parsed = JSON.parse(r.note || '{}')
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items.forEach((pi: any) => {
            inactiveQuantities[pi.id] = (inactiveQuantities[pi.id] || 0) + (pi.quantity || 1)
          })
        }
      } catch (e) {}
    })
  }

  parseNotes(previousCancellations || [])
  parseNotes(previousReturns || [])

  // 4. Validate requested quantities
  request.items.forEach(reqItem => {
    const item = allItems.find(i => i.id === reqItem.id)
    if (!item) throw new Error(`Invalid item: ${reqItem.id}`)
    
    const inactive = inactiveQuantities[item.id] || 0
    const available = item.quantity - inactive
    
    if (reqItem.quantity > available) {
      throw new Error(`Cannot ${request.action} ${reqItem.quantity} units of item. Only ${available} available.`)
    }
  })

  // 5. Calculate new active totals
  let newSubtotal = 0
  allItems.forEach(item => {
    const inactive = inactiveQuantities[item.id] || 0
    let requestedActionQty = 0
    if (request.action === 'cancel' || request.action === 'return') {
       const reqItem = request.items.find(i => i.id === item.id)
       if (reqItem) requestedActionQty = reqItem.quantity
    }
    // Exchange doesn't change active subtotal financially in the same way (assuming price match), 
    // but for now NOVA treats exchanges as separate requests, leaving subtotal intact.
    
    const activeQtyForCalculation = item.quantity - inactive - requestedActionQty
    if (activeQtyForCalculation > 0) {
      newSubtotal += item.price_at_purchase * activeQtyForCalculation
    }
  })
  
  let newShipping = 0
  if (newSubtotal > 0) {
    newShipping = newSubtotal >= 500 ? 0 : 50
  }

  const newPlatformFee = newSubtotal * 0.05 // 5% fee
  const newSellerPayout = newSubtotal - newPlatformFee
  const newTotal = newSubtotal + newShipping

  // Original total for this computation step is based on current state in DB
  const refundAmount = (request.action === 'cancel' || request.action === 'return') ? Math.max(0, order.total - newTotal) : 0

  // 6. Update Orders Table (Only for Cancel. Returns usually process refunds AFTER seller approval, 
  // but to keep it unified we record the request and update totals if auto-approved. Let's auto-update for Cancel, but for Return wait for admin?)
  // Actually, standard e-commerce deducts totals immediately for cancellations. For returns, it's typically upon approval.
  // We'll update the table immediately for both to keep the UI state accurate per the NoSQL hack.
  if (request.action === 'cancel' || request.action === 'return') {
    if (newSubtotal === 0) {
      await adminClient.from('orders').update({
        status: request.action === 'cancel' ? 'cancelled' : 'return_requested',
        subtotal: 0,
        shipping: 0,
        platform_fee: 0,
        seller_payout: 0,
        total: 0
      }).eq('id', orderId)
    } else {
      await adminClient.from('orders').update({
        subtotal: newSubtotal,
        shipping: newShipping,
        platform_fee: newPlatformFee,
        seller_payout: newSellerPayout,
        total: newTotal
      }).eq('id', orderId)
    }
  }

  // 7. Insert Request Record
  const actionNote = JSON.stringify({
    message: request.note || '',
    items: request.items,
    refund_amount: refundAmount,
    shipping_deducted: order.shipping === 0 && newShipping > 0 ? newShipping : 0
  })

  if (request.action === 'cancel') {
    await adminClient.from('cancellation_requests').insert({
      order_id: orderId,
      user_id: user.id,
      reason: request.reason,
      note: actionNote,
      status: 'approved'
    })
  } else if (request.action === 'return') {
    await adminClient.from('return_requests').insert({
      order_id: orderId,
      user_id: user.id,
      reason: request.reason,
      note: actionNote,
      status: 'pending' // Returns usually require approval
    })
  } else if (request.action === 'exchange') {
    await adminClient.from('exchange_requests').insert({
      order_id: orderId,
      user_id: user.id,
      reason: request.reason,
      note: actionNote,
      status: 'pending'
    })
  }

  // 7.5 Notify Seller
  try {
    const { data: store } = await adminClient.from('stores').select('owner_id').eq('id', order.store_id).single()
    if (store?.owner_id) {
       const { createNotification } = await import('@/app/actions/notifications')
       const actionVerb = request.action === 'cancel' ? 'Cancellation' : request.action === 'return' ? 'Return' : 'Exchange';
       
       await createNotification(store.owner_id, {
         title: `New ${actionVerb} Request`,
         message: `A customer has requested a ${actionVerb.toLowerCase()} for ${request.items.reduce((a, b) => a + b.quantity, 0)} item(s) in Order #${order.order_group_id.split('-')[0]}.`,
         type: 'order',
         related_id: order.id,
         icon: 'Undo2',
         href: `/seller/orders/${order.id}`
       })
       
       // Also notify admins
       const { notifyAdmins } = await import('@/app/actions/notifications')
       await notifyAdmins({
         title: `New ${actionVerb} Request (Platform)`,
         message: `A customer requested a ${actionVerb.toLowerCase()} on Store #${order.store_id}`,
         type: 'system',
         related_id: order.id,
         icon: 'Undo2',
         href: `/platform-admin/orders/${order.id}`
       })

       // Notify Customer
       const isAutoApproved = request.action === 'cancel'
       await createNotification(user.id, {
         title: `${actionVerb} ${isAutoApproved ? 'Approved' : 'Requested'}`,
         message: isAutoApproved 
           ? `Your cancellation for ${request.items.reduce((a, b) => a + b.quantity, 0)} item(s) has been successfully processed.` 
           : `We have received your ${actionVerb.toLowerCase()} request. The seller will review it shortly.`,
         type: 'order',
         related_id: order.id,
         icon: 'CheckCircle',
         href: `/account/orders/${order.id}`
       })
    }
  } catch (e) {
    console.error('Failed to notify parties of OMS request', e)
  }

  // 8. Insert History
  await adminClient.from('order_status_history').insert({
    order_id: orderId,
    status: newSubtotal === 0 ? (request.action === 'cancel' ? 'cancelled' : 'return_requested') : order.status,
    note: `Partial ${request.action} requested for ${request.items.reduce((a, b) => a + b.quantity, 0)} items: ${request.reason}`,
    created_by: user.id
  })

  // 9. Handle Refund (For Cancel, issue immediately. For return, maybe issue 'pending')
  if (order.stripe_payment_intent_id && order.stripe_payment_intent_id !== 'COD' && refundAmount > 0) {
    const refundReason = JSON.stringify({
      message: `Items ${request.action}: ${request.reason}`,
      items: request.items,
      original_total: order.total,
      new_total: newTotal,
      shipping_adjusted: order.shipping === 0 && newShipping > 0
    })

    await adminClient.from('refunds').insert({
      order_id: orderId,
      user_id: user.id,
      amount: refundAmount,
      payment_method: order.shipping_address?.paymentMethod || 'Prepaid',
      reason: refundReason,
      status: request.action === 'cancel' ? 'pending' : 'pending' // returns are pending
    })
  }

  revalidatePath('/account/orders')
  revalidatePath(`/account/orders/${orderId}`)
  
  return { 
    success: true, 
    refundAmount,
    shippingDeducted: order.shipping === 0 && newShipping > 0 ? newShipping : 0
  }
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

  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await adminClient.from('refunds').update(updatePayload).eq('id', refundId)
  if (error) throw new Error(error.message)

  // Notify customer
  try {
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: refund } = await adminClient.from('refunds').select('order_id, user_id, amount').eq('id', refundId).single()
    if (refund && refund.user_id) {
       const { createNotification } = await import('@/app/actions/notifications')
       await createNotification(refund.user_id, {
         title: `Refund ${status.charAt(0).toUpperCase() + status.slice(1)}`,
         message: `Your refund of ₹${refund.amount.toFixed(2)} is now ${status}.`,
         type: 'payment',
         related_id: refund.order_id,
         icon: 'RefreshCw',
         href: `/account/orders/${refund.order_id}`
       })
    }
  } catch (err) {
    console.error('Failed to notify customer of refund update', err)
  }

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

  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
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
