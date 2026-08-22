import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SellerOrdersClient from './SellerOrdersClient'

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Fetch only this store's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, price_at_purchase,
        product_variants (
          products ( title )
        )
      )
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage fulfillment for your portion of customer purchases.</p>
      </div>

      <SellerOrdersClient orders={orders || []} />
    </div>
  )
}
