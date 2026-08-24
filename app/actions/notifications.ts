'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export type NotificationData = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  related_id?: string
  created_at: string
  icon?: string
  href?: string
}

// We use a dummy product in the database to store notifications in the reviews table (NoSQL hack)
// because we cannot run DDL to create the notifications table.
const NOTIFICATIONS_PRODUCT_ID = 'bccb05e4-d616-479c-89ba-7f43679eb209'

export async function createNotification(userId: string, data: Partial<NotificationData>) {
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const payload = {
    type: data.type || 'system',
    title: data.title || '',
    message: data.message || '',
    related_id: data.related_id,
    icon: data.icon,
    href: data.href,
    is_read: false
  }

  await adminClient.from('reviews').insert({
    product_id: NOTIFICATIONS_PRODUCT_ID,
    customer_id: userId,
    rating: 1, // 1 identifies it as a notification
    body: JSON.stringify(payload)
  })
}

export async function notifyAdmins(data: Partial<NotificationData>) {
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data: admins } = await adminClient.from('profiles').select('id').eq('role', 'platform_admin')
  if (admins && admins.length > 0) {
    const payload = {
      type: data.type || 'system',
      title: data.title || '',
      message: data.message || '',
      related_id: data.related_id,
      icon: data.icon,
      href: data.href,
      is_read: false
    }

    const reviews = admins.map(admin => ({
      product_id: NOTIFICATIONS_PRODUCT_ID,
      customer_id: admin.id,
      rating: 1,
      body: JSON.stringify(payload)
    }))
    await adminClient.from('reviews').insert(reviews)
  }
}

export async function fetchNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [], unreadCount: 0 }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, body, created_at')
    .eq('customer_id', user.id)
    .eq('product_id', NOTIFICATIONS_PRODUCT_ID)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!reviews) return { notifications: [], unreadCount: 0 }

  const notifications: NotificationData[] = reviews.map(r => {
    let payload = {} as any
    try { payload = JSON.parse(r.body || '{}') } catch (e) {}
    return {
      id: r.id,
      user_id: user.id,
      created_at: r.created_at,
      ...payload
    }
  })

  const unreadCount = notifications.filter(n => !n.is_read).length
  return { notifications, unreadCount }
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  
  // Need admin client to update since RLS on reviews might prevent updating body
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Get current body
  const { data: review } = await adminClient.from('reviews').select('body').eq('id', notificationId).single()
  if (!review) return
  
  let payload = {} as any
  try { payload = JSON.parse(review.body || '{}') } catch (e) {}
  payload.is_read = true
  
  await adminClient.from('reviews').update({ body: JSON.stringify(payload) }).eq('id', notificationId)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data: reviews } = await adminClient
    .from('reviews')
    .select('id, body')
    .eq('customer_id', user.id)
    .eq('product_id', NOTIFICATIONS_PRODUCT_ID)
    
  if (reviews) {
    for (const r of reviews) {
      let payload = {} as any
      try { payload = JSON.parse(r.body || '{}') } catch (e) {}
      if (!payload.is_read) {
        payload.is_read = true
        await adminClient.from('reviews').update({ body: JSON.stringify(payload) }).eq('id', r.id)
      }
    }
  }
}

export async function clearNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('reviews').delete().eq('customer_id', user.id).eq('product_id', NOTIFICATIONS_PRODUCT_ID)
}

export async function fetchSellerNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) return []

  const notifications = []

  // 1. New Orders
  const { data: newOrders } = await supabase.from('orders')
    .select('id, order_group_id, created_at, profiles(name)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (newOrders) {
    for (const order of newOrders) {
      notifications.push({
        id: `order-${order.id}`,
        title: 'New Order Received',
        desc: `Order #${order.order_group_id.split('-')[0]} from ${(order.profiles as any)?.name || 'Customer'}`,
        time: order.created_at,
        icon: 'Package',
        href: `/seller/orders/${order.id}`,
        unread: false
      })
    }
  }

  // 2. Cancellations
  const { data: cancellations } = await supabase.from('cancellation_requests')
    .select('id, reason, created_at, orders!inner(id, order_group_id, store_id)')
    .eq('orders.store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)
    
  if (cancellations) {
    for (const cancel of cancellations) {
      notifications.push({
        id: `cancel-${cancel.id}`,
        title: 'Order Cancelled',
        desc: `Order #${(cancel.orders as any).order_group_id.split('-')[0]} was cancelled: ${cancel.reason}`,
        time: cancel.created_at,
        icon: 'XCircle',
        href: `/seller/cancellations`,
        unread: true
      })
    }
  }

  // 3. Returns
  const { data: returns } = await supabase.from('return_requests')
    .select('id, reason, status, created_at, orders!inner(id, order_group_id, store_id)')
    .eq('orders.store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (returns) {
    for (const ret of returns) {
      notifications.push({
        id: `return-${ret.id}`,
        title: `Return ${ret.status === 'pending' ? 'Requested' : 'Updated'}`,
        desc: `Return for Order #${(ret.orders as any).order_group_id.split('-')[0]} (${ret.status})`,
        time: ret.created_at,
        icon: 'Undo2',
        href: `/seller/returns`,
        unread: ret.status === 'pending'
      })
    }
  }

  // 4. Exchanges
  const { data: exchanges } = await supabase.from('exchange_requests')
    .select('id, reason, status, created_at, orders!inner(id, order_group_id, store_id)')
    .eq('orders.store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (exchanges) {
    for (const ex of exchanges) {
      notifications.push({
        id: `exchange-${ex.id}`,
        title: `Exchange ${ex.status === 'pending' ? 'Requested' : 'Updated'}`,
        desc: `Exchange for Order #${(ex.orders as any).order_group_id.split('-')[0]} (${ex.status})`,
        time: ex.created_at,
        icon: 'RefreshCw',
        href: `/seller/exchanges`,
        unread: ex.status === 'pending'
      })
    }
  }

  // 5. Refunds
  const { data: refunds } = await supabase.from('refunds')
    .select('id, amount, status, requested_at, orders!inner(id, order_group_id, store_id)')
    .eq('orders.store_id', store.id)
    .order('requested_at', { ascending: false })
    .limit(10)

  if (refunds) {
    for (const ref of refunds) {
      notifications.push({
        id: `refund-${ref.id}`,
        title: `Refund ${ref.status === 'pending' ? 'Requested' : 'Updated'}`,
        desc: `₹${ref.amount} refund for Order #${(ref.orders as any).order_group_id.split('-')[0]} (${ref.status})`,
        time: ref.requested_at,
        icon: 'CreditCard',
        href: `/seller/refunds`,
        unread: ref.status === 'pending'
      })
    }
  }

  // Sort all notifications by time descending
  return notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)
}