import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderChat } from '@/components/shared/OrderChat'
import { ArrowLeft, CheckCircle2, Circle, Package, Truck, Store, XCircle, AlertTriangle } from 'lucide-react'
import { ModifyOrderWorkflow } from '@/components/storefront/ModifyOrderWorkflow'
import { calculateEligibility } from '@/lib/eligibility'
import Image from 'next/image'

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup?redirect=/account')
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      stores ( name, slug ),
      order_items (
        id, quantity, price_at_purchase,
        product_variants ( id, sku, size, color, products ( title, product_images (url) ) )
      ),
      order_status_history ( status, created_at ),
      return_requests ( id, order_item_id, status, note ),
      exchange_requests ( id, order_item_id, status, note ),
      refunds ( amount, refund_method, status, requested_at, completed_at, reason ),
      cancellation_requests ( note )
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching order details:", error)
  }

  if (!order) notFound()

  // Timeline helper
  const timelineStages = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ]

  const history = order.order_status_history || []
  const reachedStages = history.map((h: any) => h.status)
  
  const getStageDate = (key: string) => {
    const entry = history.find((h: any) => h.status === key)
    return entry ? new Date(entry.created_at).toLocaleString() : null
  }

  const isCancelled = order.status === 'cancelled'
  const isReturned = order.status.startsWith('return')
  const isExchanged = order.status.startsWith('exchange')
  const isAbnormal = isCancelled || isReturned || isExchanged

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 space-y-8">
      <div>
        <Link href="/account/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Order #{order.order_group_id.split('-')[0]}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Store className="w-4 h-4" /> {order.stores?.name} • Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Badge className="text-sm px-4 py-1.5 uppercase tracking-wider font-bold" variant={isAbnormal ? 'destructive' : 'default'}>
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled && (
                <div className="p-5 mt-6 bg-red-50/50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-2xl border border-red-500/20 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <XCircle className="w-5 h-5" /> Order Cancelled
                  </div>
                  <p className="text-sm">
                    {history.find((h:any) => h.status === 'cancelled')?.note || 'This order was cancelled.'}
                  </p>
                </div>
              )}
              {isReturned && (
                <div className="p-5 mt-6 bg-amber-50/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-500/20 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <AlertTriangle className="w-5 h-5" /> Return Requested
                  </div>
                  <p className="text-sm">
                    {history.find((h:any) => h.status === 'return_pending' || h.status === 'returned')?.note || 'A return request was filed for this order.'}
                  </p>
                </div>
              )}
              
              <div className="relative border-l-2 border-muted ml-4 space-y-8 py-2 mt-6">
                {timelineStages.map((stage, idx) => {
                  const date = getStageDate(stage.key)
                  const isReached = reachedStages.includes(stage.key)
                  const isCurrent = order.status === stage.key
                  
                  const stageIndex = timelineStages.findIndex(s => s.key === stage.key)
                  const currentStatusIndex = timelineStages.findIndex(s => s.key === order.status)
                  // For abnormal states, we assume the previous states up to 'confirmed' or 'packed' were reached based on history
                  const isPassed = !isAbnormal ? currentStatusIndex >= stageIndex : isReached;

                  // Skip rendering future normal stages if cancelled/returned and we never reached them
                  if (isAbnormal && !isReached && stageIndex > Math.max(...reachedStages.map((s:string) => timelineStages.findIndex(ts => ts.key === s)))) {
                    return null;
                  }

                  return (
                    <div key={stage.key} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-0 bg-background rounded-full p-0.5`}>
                        {(isReached || isPassed) ? (
                          <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-blue-500' : 'text-green-500'}`} />
                        ) : (
                          <Circle className="w-4 h-4 text-muted" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center -mt-1.5">
                        <span className={`font-semibold ${isCurrent ? 'text-foreground' : (isReached || isPassed) ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                          {stage.label}
                        </span>
                        {date && <span className="text-sm text-muted-foreground">{date}</span>}
                      </div>
                    </div>
                  )
                })}
                {isAbnormal && (
                  <div className="relative pl-8 mt-8">
                    <div className="absolute -left-[9px] top-0 bg-background rounded-full p-0.5">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center -mt-1.5">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {isCancelled ? 'Cancelled' : isReturned ? 'Returned' : 'Exchanged'}
                      </span>
                      <span className="text-sm text-muted-foreground">{getStageDate(order.status)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <ModifyOrderWorkflow order={order} variant="detail" />
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0 sm:p-6">
              {order.order_items?.map((item: any, idx: number) => {
                const product = item.product_variants?.products
                const eligibility = calculateEligibility(order, item, order.return_requests, order.exchange_requests)
                const image = product?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url
                
                let cancelledQty = 0
                let returnedQty = 0
                let exchangedQty = 0

                const parse = (records: any[], type: string) => {
                  records?.forEach(r => {
                    try {
                      const p = JSON.parse(r.note || '{}')
                      if (p.items) {
                        p.items.forEach((i: any) => {
                          if (i.id === item.id) {
                            if (type === 'cancel') cancelledQty += (i.quantity || 1)
                            if (type === 'return') returnedQty += (i.quantity || 1)
                            if (type === 'exchange') exchangedQty += (i.quantity || 1)
                          }
                        })
                      }
                      // For backward compat
                      if (type === 'cancel' && p.item_ids && p.item_ids.includes(item.id)) {
                        cancelledQty = item.quantity
                      }
                    } catch(e) {}
                  })
                }

                parse(order.cancellation_requests, 'cancel')
                parse(order.return_requests, 'return')
                parse(order.exchange_requests, 'exchange')

                if (order.status === 'cancelled' && order.subtotal === 0) {
                  cancelledQty = item.quantity
                }

                const totalInactive = cancelledQty + returnedQty + exchangedQty
                const isFullyInactive = totalInactive >= item.quantity

                return (
                  <div key={item.id} className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-0 ${idx !== order.order_items.length - 1 ? 'border-b border-border/50 pb-6 sm:mb-6' : ''}`}>
                    <div className="w-full sm:w-28 h-48 sm:h-28 bg-muted/30 rounded-xl overflow-hidden relative shrink-0 border border-border/50 shadow-sm">
                      {image ? <Image src={image} alt="" fill className={`object-cover ${isFullyInactive ? 'grayscale opacity-60' : ''}`} /> : null}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className={`font-bold text-base line-clamp-2 ${isFullyInactive ? 'line-through text-muted-foreground' : ''}`}>{product?.title || 'Unknown Product'}</h4>
                          <div className="flex flex-col gap-1 shrink-0">
                            {cancelledQty > 0 && <Badge variant="destructive" className="rounded-full px-2">Cancelled {cancelledQty}</Badge>}
                            {returnedQty > 0 && <Badge variant="destructive" className="bg-amber-500 rounded-full px-2">Returned {returnedQty}</Badge>}
                            {exchangedQty > 0 && <Badge variant="destructive" className="bg-blue-500 rounded-full px-2">Exchanged {exchangedQty}</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.product_variants?.size && <Badge variant="secondary" className="font-medium bg-muted/50">Size: {item.product_variants.size}</Badge>}
                          {item.product_variants?.color && <Badge variant="secondary" className="font-medium bg-muted/50">Color: {item.product_variants.color}</Badge>}
                          <Badge variant="outline" className="font-medium text-muted-foreground border-border/50">Qty: {item.quantity}</Badge>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex flex-col items-end justify-between w-full sm:w-auto">
                        <div className="flex justify-between items-end w-full gap-4">
                          <div className="text-sm text-muted-foreground">
                            ₹{item.price_at_purchase.toLocaleString('en-IN', {minimumFractionDigits: 2})} each
                          </div>
                          <div className="font-heading text-lg font-bold text-foreground">
                            ₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <OrderChat orderId={order.id} currentUserId={user.id} />

        </div>

        <div className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-green-500">-₹{(order.shipping_address?.discount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>₹{order.shipping.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span>₹{(order.shipping_address?.gst || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="border-t pt-3 mt-1 flex justify-between font-black text-lg"><span>Total</span><span>₹{order.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              
              {order.refunds && order.refunds.length > 0 && (
                <div className="border-t border-red-500/20 pt-3 mt-3 space-y-3">
                  <div className="font-bold text-red-600 dark:text-red-400 text-sm">Refunds Issued</div>
                  {order.refunds.map((refund: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex flex-col">
                        <span>{refund.reason && refund.reason.includes('{') ? JSON.parse(refund.reason).message : refund.reason || 'Refund'}</span>
                        <span className="text-xs">{refund.status}</span>
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-bold">₹{refund.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="font-bold mb-1">{order.shipping_address?.name}</div>
              <div className="text-muted-foreground leading-relaxed">
                {order.shipping_address?.address}<br/>
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}<br/>
                Mobile: {order.shipping_address?.mobile_number}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.shipping_address?.paymentMethod === 'COD' ? 'Cash on Delivery' : order.shipping_address?.paymentMethod || 'Prepaid'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.shipping_address?.paymentMethod === 'COD' && order.status !== 'delivered' ? 'outline' : 'default'} className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                  {order.shipping_address?.paymentMethod === 'COD' && order.status !== 'delivered' ? 'Pending' : 'Paid'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Refund Status display if any exists */}
          {order.refunds && order.refunds.length > 0 ? (
            <Card className="border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <CardHeader className="bg-purple-500/5 pb-4">
                <CardTitle className="text-purple-600 flex items-center justify-between">
                  <span>Refund Status</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">{order.refunds[0].status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm">
                {order.refunds.map((r: any, idx: number) => {
                  const stages = [
                    { key: 'pending', label: 'Refund Requested' },
                    { key: 'approved', label: 'Refund Approved' },
                    { key: 'initiated', label: 'Refund Initiated' },
                    { key: 'completed', label: 'Refund Completed' }
                  ];
                  // If rejected, just show rejected
                  if (r.status === 'rejected') {
                    return (
                      <div key={idx} className="text-red-500 font-bold p-3 bg-red-50 rounded-md">
                        Refund Request Rejected. Please contact support.
                      </div>
                    )
                  }
                  
                  const currentIndex = stages.findIndex(s => s.key === r.status);
                  const isCompleted = r.status === 'completed';

                  return (
                    <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-base">₹{r.amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                      </div>
                      
                      <div className="space-y-4">
                        {stages.map((stage, sIdx) => {
                          const isPassed = currentIndex >= sIdx;
                          const isCurrent = currentIndex === sIdx;
                          return (
                            <div key={stage.key} className="flex items-center gap-3">
                              {isPassed ? (
                                <CheckCircle2 className={`w-5 h-5 ${isCurrent && !isCompleted ? 'text-blue-500' : 'text-green-500'}`} />
                              ) : (
                                <Circle className="w-5 h-5 text-muted" />
                              )}
                              <span className={`font-medium ${isCurrent ? 'text-foreground' : isPassed ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                                {stage.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                        <span>Method: {r.refund_method.replace('_', ' ').toUpperCase()}</span>
                        {r.completed_at && <span>Completed: {new Date(r.completed_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ) : isAbnormal && (order.shipping_address?.paymentMethod === 'COD' || order.stripe_payment_intent_id === 'COD') ? (
            <Card className="border-muted bg-muted/20">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No refund is required for Cash on Delivery orders.</p>
              </CardContent>
            </Card>
          ) : null}

        </div>
      </div>
    </div>
  )
}
