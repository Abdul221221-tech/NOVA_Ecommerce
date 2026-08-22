import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderChat } from '@/components/shared/OrderChat'
import { ArrowLeft } from 'lucide-react'
import { updateOrderFulfillment } from '@/app/actions/fulfillment'

export default async function SellerOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/seller/login')

  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      profiles ( name, email ),
      order_items (
        id, quantity, price_at_purchase,
        product_variants ( sku, size, color, products ( title, product_images (url) ) )
      )
    `)
    .eq('id', params.id)
    .eq('store_id', store.id)
    .single()

  if (!order) notFound()

  // Server Action for updating tracking/status
  const handleFulfillment = async (formData: FormData) => {
    'use server'
    const tracking = formData.get('tracking') as string
    const status = formData.get('status') as string
    await updateOrderFulfillment(order.id, status, tracking)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div>
        <Link href="/seller/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-heading text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleFulfillment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tracking Number</label>
                    <Input name="tracking" defaultValue={order.tracking_number || ''} placeholder="e.g. 1Z9999999999999999" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select name="status" defaultValue={order.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid (Unfulfilled)</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled" className="text-destructive">Cancelled</SelectItem>
                        {order.status === 'disputed' && <SelectItem value="disputed" disabled>Disputed</SelectItem>}
                        {order.status === 'returned' && <SelectItem value="returned" disabled>Returned</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit">Save Fulfillment Data</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map((item: any) => {
                const product = item.product_variants?.products
                const image = product?.product_images?.[0]?.url
                return (
                  <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden relative shrink-0">
                      {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{product?.title || 'Unknown Product'}</h4>
                      <div className="text-sm text-muted-foreground space-x-2">
                        {item.product_variants?.sku && <span className="font-mono">SKU: {item.product_variants.sku}</span>}
                        {item.product_variants?.size && <span>Size: {item.product_variants.size}</span>}
                      </div>
                      <div className="mt-1 flex justify-between text-sm">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium">₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Real-time Chat with Buyer */}
          <OrderChat orderId={order.id} currentUserId={user.id} />

        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact</div>
                <p className="font-medium">{order.profiles?.name || 'Guest'}</p>
                <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
              </div>
              
              {order.shipping_address && (
                <div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1 mt-4">Shipping Address</div>
                  <div className="text-sm">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.line1}</p>
                    {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Order Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform Fee</span><span className="text-destructive">-${order.platform_fee.toFixed(2)}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Your Payout</span><span className="text-status-success">₹{order.seller_payout.toLocaleString('en-IN')}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
