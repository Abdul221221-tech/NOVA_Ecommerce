import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'New Arrivals | NOVA',
  description: 'Discover the latest products freshly added to NOVA Marketplace — be the first to shop new arrivals from our independent creators and flagship brands.',
}

export default async function NewArrivalsPage() {
  const supabase = await createClient()

  // Fetch products marked as new arrivals, ordered newest first
  const { data: newArrivals } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, brand, description, created_at,
      categories!inner ( id, name, slug ),
      stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
      product_images ( url, sort_order ),
      reviews ( rating ),
      product_variants ( id, size, color )
    `)
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })

  // Also fetch "coming soon" products for the teaser section
  const { data: comingSoon } = await supabase
    .from('products')
    .select(`
      id, title, brand, description,
      product_images ( url, sort_order )
    `)
    .eq('status', 'active')
    .eq('is_coming_soon', true)
    .order('created_at', { ascending: false })
    .limit(4)

  // Fallback: if no explicitly marked new arrivals, show the 20 most recently added products
  const { data: recentFallback } = (!newArrivals || newArrivals.length === 0)
    ? await supabase
        .from('products')
        .select(`
          id, title, price, compare_at_price, brand, description, created_at,
          categories!inner ( id, name, slug ),
          stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
          product_images ( url, sort_order ),
          reviews ( rating ),
          product_variants ( id, size, color )
        `)
        .eq('status', 'active')
        .eq('stores.status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: null }

  const products = (newArrivals && newArrivals.length > 0) ? newArrivals : (recentFallback || [])
  const isFallback = !newArrivals || newArrivals.length === 0

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-12 flex flex-col gap-16">

      {/* Hero Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-primary/10">
            <Sparkles className="w-5 h-5 text-accent-primary" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-accent-primary">Fresh Drops</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
              <ScrollReveal>New Arrivals</ScrollReveal>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-base">
              {isFallback
                ? 'Our most recently added products — always something new to discover.'
                : 'Freshly launched products from our independent creators and flagship brands.'}
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold text-accent-primary hover:underline shrink-0"
          >
            Browse all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-muted/20 rounded-2xl border">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-1">Nothing here yet</p>
          <p className="text-sm">Check back soon — sellers are adding new products every day!</p>
          <Link href="/products" className="inline-flex items-center gap-2 mt-6 text-accent-primary font-semibold hover:underline">
            Browse all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product: any) => {
              const activePromo = product.stores?.promotions?.find((p: any) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
                const hasStarted = new Date(p.starts_at) <= new Date()
                return p.is_active && !isExpired && hasStarted
              })
              const badgeText = activePromo
                ? (activePromo.discount_type === 'percentage' ? `${activePromo.value}% OFF` : `₹${activePromo.value} OFF`)
                : undefined

              return (
                <SpotlightCard key={product.id}>
                  <ProductCard product={product} promoBadge={badgeText ?? 'NEW'} />
                </SpotlightCard>
              )
            })}
          </div>
        </section>
      )}

      {/* Coming Soon Strip */}
      {comingSoon && comingSoon.length > 0 && (
        <section className="border-t pt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted">
              <span className="text-lg">🔜</span>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold">Coming Soon</h2>
              <p className="text-muted-foreground text-sm">Products launching soon — stay tuned!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comingSoon.map((product: any) => {
              const imageUrl = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url
              return (
                <div key={product.id} className="relative rounded-2xl overflow-hidden border bg-muted/30 aspect-[3/4] flex flex-col justify-end group">
                  {imageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4">
                    {product.brand && (
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-1">{product.brand}</p>
                    )}
                    <p className="font-heading font-bold text-white text-base leading-snug">{product.title}</p>
                    <span className="mt-2 inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">Coming Soon</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
