import { getSimilarProducts } from '@/app/actions/recommendations'
import { ProductCarousel } from '@/components/storefront/ProductCarousel'
import { Sparkles } from 'lucide-react'

export async function YouMightAlsoLike({ productId }: { productId: string }) {
  const similarProducts = await getSimilarProducts(productId)

  if (!similarProducts || similarProducts.length === 0) return null

  // Map the RPC return type to the ProductCard expected prop structure
  const formattedProducts = similarProducts.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    compare_at_price: p.compare_at_price,
    stores: { name: p.store_name, slug: p.store_slug },
    product_images: p.primary_image ? [{ url: p.primary_image, sort_order: 0 }] : []
  }))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="w-5 h-5 text-accent-primary" />
        <h2 className="font-heading text-3xl font-bold">You Might Also Like</h2>
      </div>
      <ProductCarousel products={formattedProducts} />
    </div>
  )
}
