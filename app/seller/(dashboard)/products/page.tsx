import { createClient } from '@/lib/supabase/server'
import ProductListClient from './ProductListClient'
import { redirect } from 'next/navigation'

export default async function SellerProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  
  // This is a failsafe. Middleware should already handle this.
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Fetch only this store's products, plus their variants and images for aggregation
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, title, status, price, 
      product_variants ( id, stock_quantity ),
      product_images ( id, url, sort_order )
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ProductListClient products={products || []} />
    </div>
  )
}
