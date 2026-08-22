'use client'

import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ProductCard } from '@/components/storefront/ProductCard'
import Link from 'next/link'

export default function RecentlyViewedPage() {
  const { recentlyViewed } = useStorefront()

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-[60vh] pb-48">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold mb-2">Recently Viewed</h1>
        <p className="text-muted-foreground">Products you've looked at during this session.</p>
      </div>

      {recentlyViewed.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 bg-muted/10 rounded-md">
          You haven't viewed any products yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recentlyViewed.map(product => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                stores: { name: product.storeName || 'Unknown', slug: '' },
                product_images: product.imageUrl ? [{ url: product.imageUrl, sort_order: 0 }] : []
              }} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
