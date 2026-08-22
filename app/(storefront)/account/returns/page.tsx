import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, RefreshCcw, Undo2, ChevronRight, XCircle } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'My Returns & Exchanges - NOVA'
}

export default async function CustomerReturnsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account/returns')
  }

  // Fetch Returns
  const { data: returns } = await supabase
    .from('return_requests')
    .select(`
      id, status, reason, created_at,
      orders ( id, order_group_id ),
      order_items (
        quantity, price_at_purchase,
        product_variants ( size, color, products ( title, product_images(url) ) )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch Exchanges
  const { data: exchanges } = await supabase
    .from('exchange_requests')
    .select(`
      id, status, reason, created_at, requested_variant_id,
      orders ( id, order_group_id ),
      order_items (
        quantity, price_at_purchase,
        product_variants ( size, color, products ( title, product_images(url) ) )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allRequests = [
    ...(returns?.map(r => ({ ...r, type: 'return' })) || []),
    ...(exchanges?.map(e => ({ ...e, type: 'exchange' })) || [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 space-y-8">
      <div>
        <Link href="/account" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account
        </Link>
        <h1 className="font-heading text-3xl font-bold">My Returns & Exchanges</h1>
        <p className="text-muted-foreground mt-1">Track the status of your returned and exchanged products.</p>
      </div>

      <div className="space-y-6">
        {allRequests.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Requests Found</h3>
            <p className="text-muted-foreground">You haven't requested any returns or exchanges.</p>
          </div>
        ) : (
          allRequests.map((req: any) => {
            const product = req.order_items?.product_variants?.products
            const image = product?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url

            let badgeVariant = 'default' as any
            if (req.status === 'completed' || req.status === 'approved') badgeVariant = 'default'
            if (req.status === 'rejected' || req.status === 'cancelled') badgeVariant = 'destructive'
            if (req.status === 'pending') badgeVariant = 'secondary'

            return (
              <Card key={req.id} className="overflow-hidden hover:border-foreground/20 transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="p-6 bg-muted/10 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-border/50 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {req.type === 'return' ? <Undo2 className="w-4 h-4 text-amber-500" /> : <RefreshCcw className="w-4 h-4 text-blue-500" />}
                          {req.type === 'return' ? 'Return Request' : 'Exchange Request'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mb-4">REQ-{req.id.substring(0,8).toUpperCase()}</div>
                        
                        <div className="text-sm font-medium mb-1">Order #{req.orders?.order_group_id?.split('-')[0]}</div>
                        <div className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</div>
                      </div>
                      
                      <div>
                        <Badge variant={badgeVariant} className="uppercase tracking-wider text-[10px] font-bold">
                          {req.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex gap-4">
                      <div className="w-20 h-20 bg-muted/30 rounded-lg overflow-hidden relative shrink-0 border border-border/50">
                        {image && <Image src={image} alt="" fill className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm sm:text-base line-clamp-1 mb-1">{product?.title || 'Unknown Product'}</h4>
                        <div className="text-xs text-muted-foreground mb-3">Reason: {req.reason}</div>
                        
                        <div className="flex flex-wrap gap-2">
                          {req.order_items?.product_variants?.size && (
                            <Badge variant="outline" className="text-[10px]">Size: {req.order_items.product_variants.size}</Badge>
                          )}
                          {req.order_items?.product_variants?.color && (
                            <Badge variant="outline" className="text-[10px]">Color: {req.order_items.product_variants.color}</Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">Qty: {req.order_items?.quantity}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center pl-2">
                        <Link href={`/account/orders/${req.orders?.id}`}>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
