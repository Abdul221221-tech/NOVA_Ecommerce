import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Users, Package, ShoppingCart, DollarSign, RefreshCcw } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Run all count queries in parallel
  const [
    { count: totalCustomers },
    { count: totalSellers },
    { count: pendingSellers },
    { count: activeSellers },
    { count: suspendedSellers },
    { count: totalProducts },
    { count: pendingProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: pendingRefunds },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('refunds').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('platform_fee') // To calculate total platform revenue
  ])

  const totalRevenue = revenueData?.reduce((acc, order) => acc + Number(order.platform_fee), 0) || 0

  const metrics = [
    { title: 'Total Customers', value: totalCustomers || 0, icon: <Users className="w-5 h-5 text-indigo-400" /> },
    { title: 'Total Sellers', value: totalSellers || 0, icon: <Store className="w-5 h-5 text-blue-400" /> },
    { title: 'Pending Sellers', value: pendingSellers || 0, icon: <Store className="w-5 h-5 text-amber-400" /> },
    { title: 'Active Sellers', value: activeSellers || 0, icon: <Store className="w-5 h-5 text-emerald-400" /> },
    { title: 'Suspended Sellers', value: suspendedSellers || 0, icon: <Store className="w-5 h-5 text-red-400" /> },
    { title: 'Total Products', value: totalProducts || 0, icon: <Package className="w-5 h-5 text-purple-400" /> },
    { title: 'Pending Products', value: pendingProducts || 0, icon: <Package className="w-5 h-5 text-amber-400" /> },
    { title: 'Total Orders', value: totalOrders || 0, icon: <ShoppingCart className="w-5 h-5 text-cyan-400" /> },
    { title: 'Pending Orders', value: pendingOrders || 0, icon: <ShoppingCart className="w-5 h-5 text-amber-400" /> },
    { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
    { title: 'Pending Refunds', value: pendingRefunds || 0, icon: <RefreshCcw className="w-5 h-5 text-amber-400" /> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <Card key={i} className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {metric.title}
              </CardTitle>
              <div className="p-2 bg-slate-800 rounded-lg">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
