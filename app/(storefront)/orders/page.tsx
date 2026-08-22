import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CustomerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_group_id, status, subtotal, shipping, total, created_at,
      stores ( name ),
      order_items (
        id, quantity, price_at_purchase,
        product_variants (
          products ( title )
        )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold mb-8">Order History</h1>
        <div className="bg-muted/10 p-5 md:p-8 text-center rounded-lg border">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </div>
      </div>
    )
  }

  // Group by order_group_id
  const groupedOrders: Record<string, any[]> = {}
  orders.forEach(order => {
    if (!groupedOrders[order.order_group_id]) {
      groupedOrders[order.order_group_id] = []
    }
    groupedOrders[order.order_group_id].push(order)
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <h1 className="text-3xl font-heading font-bold">Order History</h1>

      {Object.entries(groupedOrders).map(([groupId, groupOrders]) => {
        const orderDate = new Date(groupOrders[0].created_at).toLocaleDateString()
        const groupTotal = groupOrders.reduce((sum, o) => sum + Number(o.total), 0)

        return (
          <Card key={groupId} className="overflow-hidden border-border/50 shadow-sm">
            <div className="bg-muted/20 px-6 py-4 flex justify-between items-center border-b">
              <div>
                <p className="text-sm font-medium">Order Placed</p>
                <p className="text-sm text-muted-foreground">{orderDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Total</p>
                <p className="text-sm text-muted-foreground">₹{groupTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Order ID</p>
                <p className="text-sm text-muted-foreground font-mono truncate w-32">{groupId}</p>
              </div>
            </div>
            
            <CardContent className="p-0 divide-y">
              {groupOrders.map(order => (
                <div key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Shipped by {order.stores.name}</h3>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">{item.quantity}x</span>
                          <span className="font-medium">{item.product_variants?.products?.title || 'Unknown Product'}</span>
                        </div>
                        <span>₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
