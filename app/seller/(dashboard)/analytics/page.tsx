import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { subDays, format, isSameDay } from 'date-fns'
import { RevenueChart } from '@/components/seller/analytics/RevenueChart'
import { CategoryChart } from '@/components/seller/analytics/CategoryChart'
import { ExportDataButton } from '@/components/seller/analytics/ExportDataButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'

export default async function SellerAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')

  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Calculate 30 days ago
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  // Fetch Orders for the last 30 days (excluding cancelled/returned if we wanted strict revenue, but we'll fetch all paid+)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, total, seller_payout,
      order_items (
        quantity, 
        product_variants (
          products ( title, category_id, categories ( name ) )
        )
      )
    `)
    .eq('store_id', store.id)
    .gte('created_at', thirtyDaysAgo)
    .in('status', ['paid', 'shipped', 'delivered'])

  const validOrders = orders || []

  // --- KPI Aggregation ---
  const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.seller_payout), 0)
  const totalOrdersCount = validOrders.length
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0

  // --- Time-Series Revenue Aggregation (Last 30 Days) ---
  // Generate an array of the last 30 dates
  const daysArray = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i)
    return { dateObj: d, date: format(d, 'MMM dd'), revenue: 0 }
  })

  validOrders.forEach(order => {
    const orderDate = new Date(order.created_at)
    // Find the bucket
    const bucket = daysArray.find(d => isSameDay(d.dateObj, orderDate))
    if (bucket) {
      bucket.revenue += Number(order.seller_payout)
    }
  })

  // --- Category Aggregation ---
  const categoryMap = new Map<string, number>()
  validOrders.forEach(order => {
    order.order_items.forEach((item: any) => {
      const catName = item.product_variants?.products?.categories?.name || 'Uncategorized'
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + item.quantity)
    })
  })

  // Sort by count descending and take top 5
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Metrics for the last 30 days.</p>
        </div>
        <ExportDataButton data={validOrders} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-primary">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on Seller Payout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrdersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Fully paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{aov.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Takes up 2 columns */}
        <RevenueChart data={daysArray.map(d => ({ date: d.date, revenue: d.revenue }))} />
        {/* Takes up 1 column */}
        <CategoryChart data={categoryData} />
      </div>
    </div>
  )
}
