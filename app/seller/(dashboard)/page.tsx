import { createClient } from '@/lib/supabase/server'
import { DashboardOverviewClient } from '@/components/seller/DashboardOverviewClient'

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
    }

    const { count: cancels } = await supabase.from('cancellation_requests').select('id', { count: 'exact', head: true })
      .eq('orders.store_id', store.id).not('orders', 'is', null) // requires inner join implicitly if possible, wait, count with inner join in supabase needs proper syntax, better to just query where store_id is present if order is fetched, or just fetch all and filter
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
