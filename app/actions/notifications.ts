'use server'

import { createClient } from '@/lib/supabase/server'
import { Package, XCircle, RefreshCw, Undo2, CreditCard } from 'lucide-react'

export interface NotificationData {
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

export async function fetchNotifications(): Promise<{notifications: NotificationData[], unreadCount: number}> {
  return { notifications: [], unreadCount: 0 }
}

export async function markAsRead(id: string) {}
export async function markAllAsRead() {}
export async function clearNotifications() {}
export async function createNotification(data: any, arg2?: any) {}

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