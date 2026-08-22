import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminRefundsClient from './AdminRefundsClient'

export default async function PlatformAdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/platform-admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'platform_admin' && user.user_metadata?.role !== 'platform_admin') {
    redirect('/')
  }

  // Fetch all orders across the platform
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      stores ( name ),
      profiles ( email )
    `)
    .order('created_at', { ascending: false })

  // Fetch Refunds
  const { data: refunds } = await supabase
    .from('refunds')
    .select(`
      *,
      orders ( order_group_id, id ),
      profiles ( email )
    `)
    .order('requested_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Platform Orders & Payouts</h1>
        <p className="text-muted-foreground">Bird's eye view of all transactions across the marketplace.</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="refunds">Refunds Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="rounded-md border bg-card mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Group ID</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Seller Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!orders || orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                      No orders processed yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs" title={order.order_group_id}>
                        {order.order_group_id.split('-')[0]}...
                      </TableCell>
                      <TableCell className="font-medium">{order.stores?.name}</TableCell>
                      <TableCell>{order.profiles?.email || 'Guest'}</TableCell>
                      <TableCell>₹{Number(order.total).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-status-warning font-medium">
                        ₹{Number(order.platform_fee).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-status-success font-medium">
                        ₹{Number(order.seller_payout).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <AdminRefundsClient refunds={refunds || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
