'use client'

import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ProductCarousel } from '@/components/storefront/ProductCarousel'

export function RecentlyViewedCarousel({ currentProductId }: { currentProductId: string }) {
  const { recentlyViewed } = useStorefront()

  const filtered = recentlyViewed.filter(p => p.id !== currentProductId)

  if (!filtered || filtered.length === 0) return null

  // Map to format expected by ProductCard
  const formattedProducts = filtered.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    stores: { name: p.storeName || 'Unknown', slug: '' },
    product_images: p.imageUrl ? [{ url: p.imageUrl, sort_order: 0 }] : []
  }))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="font-heading text-3xl font-bold">Recently Viewed</h2>
      </div>
      <ProductCarousel products={formattedProducts} />
    </div>
  )
}
