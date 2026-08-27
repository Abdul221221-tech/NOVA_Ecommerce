import { createClient } from '@/lib/supabase/server'
import { DashboardOverviewClient } from '@/components/seller/DashboardOverviewClient'
import { subDays, format, isSameDay } from 'date-fns'

export default async function SellerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: store } = await supabase.from('stores').select('id, views').eq('owner_id', user.id).single()

  let metrics = {
    revenue: 0,
    orders: 0,
    products: 0,
    views: store?.views || 0,
    recentOrders: [] as any[],
    pendingOrders: 0,
    cancellations: 0,
    refunds: 0,
    returns: 0,
    exchanges: 0,
    trendData: [] as { date: string, revenue: number }[]
  }

  if (store) {
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', store.id)
    metrics.products = productsCount || 0

    const { data: orders } = await supabase.from('orders')
      .select('id, order_group_id, seller_payout, status, profiles(email), created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (orders) {
      metrics.orders = orders.length
      metrics.pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
      metrics.revenue = orders.reduce((sum, o) => o.status !== 'cancelled' && !o.status.startsWith('return') ? sum + (o.seller_payout || 0) : sum, 0)
      metrics.recentOrders = orders.slice(0, 4)

      const daysArray = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i)
        return { dateObj: d, date: format(d, 'MMM dd'), revenue: 0 }
      })

      orders.forEach(order => {
        if (order.status !== 'cancelled' && !order.status.startsWith('return')) {
          const orderDate = new Date(order.created_at)
          const bucket = daysArray.find(d => isSameDay(d.dateObj, orderDate))
          if (bucket) bucket.revenue += Number(order.seller_payout || 0)
        }
      })
      
      metrics.trendData = daysArray.map(d => ({ date: d.date, revenue: d.revenue }))
    }
  }

  // To do inner joins properly for counts:
  if (store) {
    const [
      { data: cancels },
      { data: refunds },
      { data: returns },
      { data: exchanges }
    ] = await Promise.all([
      supabase.from('cancellation_requests').select('id, orders!inner(id)').eq('orders.store_id', store.id),
      supabase.from('refunds').select('id, orders!inner(id)').eq('orders.store_id', store.id),
      supabase.from('return_requests').select('id, orders!inner(id)').eq('orders.store_id', store.id),
      supabase.from('exchange_requests').select('id, orders!inner(id)').eq('orders.store_id', store.id)
    ])

    metrics.cancellations = cancels?.length || 0
    metrics.refunds = refunds?.length || 0
    metrics.returns = returns?.length || 0
    metrics.exchanges = exchanges?.length || 0
  }

  return <DashboardOverviewClient metrics={metrics} />
}
