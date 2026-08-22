import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, CheckCircle2, Clock, ChevronRight, Wallet, MapPin, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OrderActionButtons } from '@/components/storefront/OrderActionButtons'

export default async function CustomerAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account/orders')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_group_id, created_at, status, total, shipping_address,
      stores ( name ),
      order_items (
        id, quantity, price_at_purchase,
        product_variants (
          size, color,
          products (
            title,
            product_images ( url, sort_order )
          )
        )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'Placed', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', progress: 25 }
      case 'paid': return { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10', progress: 50 }
      case 'shipped': return { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10', progress: 75 }
      case 'delivered': return { label: 'Delivered', icon: Package, color: 'text-status-success', bg: 'bg-status-success/10', progress: 100 }
      case 'cancelled': return { label: 'Cancelled', icon: Clock, color: 'text-status-error', bg: 'bg-status-error/10', progress: 0 }
      default: return { label: 'Placed', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', progress: 25 }
    }
  }

  return (
    <div className="w-full min-h-[70vh]">
      <div className="flex items-center gap-4 mb-10">
        <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight">My Orders</h1>
      </div>
      
      {!orders || orders.length === 0 ? (
        <div className="bg-surface-base border border-border/50 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            When you place orders, they will appear here so you can track their status.
          </p>
          <Link href="/products" className="h-12 px-8 bg-foreground text-background hover:bg-accent-primary hover:text-white transition-colors rounded-xl font-bold flex items-center justify-center">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => {
            const statusInfo = getStatusDetails(order.status)
            const StatusIcon = statusInfo.icon
            
            return (
              <div key={order.id} className="bg-surface-base border border-border/50 shadow-sm hover:shadow-lg rounded-3xl overflow-hidden group hover:border-amber-500/30 transition-all duration-300 relative transform hover:-translate-y-1">
                
                {/* Header */}
                <div className="px-6 md:px-8 py-5 border-b border-border/50 bg-muted/10 group-hover:bg-amber-50/50 dark:group-hover:bg-amber-500/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-lg">Order from {order.stores?.name}</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-mono text-xs mt-0.5">ID: {order.order_group_id.split('-')[0]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-0.5">Total Amount</div>
                    <div className="font-bold text-xl font-heading">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                {/* Additional Order Info (Payment, Address, Est. Delivery) */}
                {order.shipping_address && (
                  <div className="px-6 md:px-8 py-4 border-b border-border/50 bg-surface-base grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><Wallet className="w-4 h-4"/> Payment</div>
                      <div className="font-medium">{order.shipping_address.paymentMethod === 'COD' ? 'Cash on Delivery' : order.shipping_address.paymentMethod || 'Prepaid'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> Est. Delivery</div>
                      <div className="font-medium">
                        {(() => {
                          const orderDate = new Date(order.created_at)
                          const minD = new Date(orderDate)
                          minD.setDate(orderDate.getDate() + 3)
                          const maxD = new Date(orderDate)
                          maxD.setDate(orderDate.getDate() + 5)
                          return `${minD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Delivery</div>
                      <div className="font-medium truncate" title={`${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}`}>
                        {order.shipping_address.address}, {order.shipping_address.city}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Tracker (Visual) */}
                {order.status !== 'cancelled' && (
                  <div className="px-6 md:px-8 py-6 border-b border-border/50">
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${statusInfo.progress === 100 ? 'from-green-400 to-green-500' : 'from-accent-primary to-purple-500'}`}
                        style={{ width: `${statusInfo.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
                      <span className={statusInfo.progress >= 25 ? 'text-foreground' : ''}>Placed</span>
                      <span className={statusInfo.progress >= 50 ? 'text-foreground' : ''}>Confirmed</span>
                      <span className={statusInfo.progress >= 75 ? 'text-foreground' : ''}>Shipped</span>
                      <span className={statusInfo.progress >= 100 ? 'text-status-success' : ''}>Delivered</span>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="px-6 md:px-8 py-6 space-y-6">
                  {order.order_items?.map((item: any) => {
                    const product = item.product_variants?.products
                    const variant = item.product_variants
                    const image = product?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url
                    
                    return (
                      <div key={item.id} className="flex gap-4 sm:gap-6 p-3 -mx-3 rounded-2xl hover:bg-muted/50 transition-colors">
                        <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-muted/20 shrink-0 border border-border/50 group-hover:border-amber-200 transition-colors">
                          {image ? (
                            <Image src={image} alt={product?.title || 'Product'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-semibold text-base md:text-lg line-clamp-1">{product?.title || 'Unknown Product'}</h4>
                          <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                            {variant?.size && <span>Size: {variant.size}</span>}
                            {variant?.color && <span>Color: {variant.color}</span>}
                          </div>
                          <div className="mt-2 text-sm font-medium">
                            Qty: {item.quantity} × ₹{item.price_at_purchase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer Action */}
                <div className="px-6 md:px-8 py-4 bg-muted/5 group-hover:bg-muted/10 border-t border-border/50 flex justify-end transition-colors">
                  <OrderActionButtons order={order} variant="list" />
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
