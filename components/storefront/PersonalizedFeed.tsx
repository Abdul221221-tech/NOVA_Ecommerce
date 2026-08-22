'use client'

import { useEffect, useState } from 'react'
import { getPersonalizedFeed } from '@/app/actions/recommendations'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Sparkles, Loader2 } from 'lucide-react'

export function PersonalizedFeed() {
  const { recentlyViewed } = useStorefront()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeed() {
      // Pass the IDs of recently viewed products to the server action
      const feed = await getPersonalizedFeed(recentlyViewed.map(p => p.id))
      setProducts(feed)
      setLoading(false)
    }
    loadFeed()
  }, [recentlyViewed])

  if (loading) {
    return (
      <div className="w-full py-16 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (products.length === 0) return null

  // Map RPC output to ProductCard props
  const formattedProducts = products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    compare_at_price: p.compare_at_price,
    stores: { name: p.store_name, slug: p.store_slug },
    product_images: p.primary_image ? [{ url: p.primary_image, sort_order: 0 }] : []
  }))

  return (
    <section className="w-full py-16 bg-background border-b">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-accent-primary" />
          <h2 className="font-heading text-2xl font-bold">Recommended for You</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {formattedProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>
    </section>
  )
}
