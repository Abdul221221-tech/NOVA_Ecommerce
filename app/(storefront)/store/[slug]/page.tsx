import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { ProductCard } from '@/components/storefront/ProductCard'

export default async function PublicStorePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  // Fetch store by slug, ensuring it is approved
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!store || store.status !== 'approved') {
    notFound()
  }

  // Fetch active products for this store
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price,
      product_images ( url, sort_order )
    `)
    .eq('store_id', store.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="bg-surface-inverse text-surface-base py-16">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col items-center md:flex-row md:items-start gap-8">
          <div className="size-32 rounded-full overflow-hidden bg-surface-base flex shrink-0 items-center justify-center border-4 border-surface-base">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={128} height={128} className="object-cover" />
            ) : (
              <span className="text-4xl text-surface-inverse font-bold">{store.name.charAt(0)}</span>
            )}
          </div>
          <div className="text-center md:text-left space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-accent-soft">{store.name}</h1>
            <p className="text-surface-base/80 max-w-2xl text-lg">{store.description}</p>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <h2 className="font-heading text-2xl font-bold mb-8">All Products</h2>
        {(!products || products.length === 0) ? (
          <div className="h-64 border rounded-md bg-muted/20 flex items-center justify-center text-muted-foreground">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={{ ...product, stores: { name: store.name, slug: store.slug } }} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
