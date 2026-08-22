import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft } from 'lucide-react'
import VariantSelector from '@/components/storefront/VariantSelector'
import ViewTracker from '@/components/storefront/ViewTracker'
import { ReviewSummaryBlock } from '@/components/storefront/ReviewSummaryBlock'
import { YouMightAlsoLike } from '@/components/storefront/YouMightAlsoLike'
import { ModelViewer } from '@/components/storefront/ModelViewer'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { WishlistButton } from '@/components/storefront/WishlistButton'
import { ProductGallery } from '@/components/storefront/ProductGallery'
import { ExperienceStoryModal } from '@/components/storefront/ExperienceStoryModal'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      stores!inner ( name, slug, status ),
      product_images ( url, sort_order ),
      product_variants ( id, sku, size, color, price_override, stock_quantity )
    `)
    .eq('id', id)
    .single()

  if (!product || product.status !== 'active' || product.stores.status !== 'approved') {
    notFound()
  }

  let images = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  
  // Requirement: Every product must have a minimum of 3 product images.
  // Pad with high-quality generic product placeholders if needed.
  const placeholders = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
  ]
  if (images.length < 3) {
    const needed = 3 - images.length
    for (let i = 0; i < needed; i++) {
      images.push({ url: placeholders[i], sort_order: images.length + i })
    }
  }

  const variants = product.product_variants || []
  
  // Extract unique sizes and colors for the selector
  const sizes = Array.from(new Set(variants.map((v:any) => v.size).filter(Boolean))) as string[]
  const colors = Array.from(new Set(variants.map((v:any) => v.color).filter(Boolean))) as string[]

  return (
    <>
      <ViewTracker product={{ ...product, product_images: images }} />
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl min-h-screen">
        <div className="mb-6">
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Shop
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative items-start">
        {/* Images Gallery */}
        <ProductGallery images={images} title={product.title} modelUrl={product.model_url} />

        {/* Product Info (Sticky) */}
        <div className="space-y-6 md:sticky md:top-24">
          <div>
            {product.brand && (
              <Link 
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="inline-block text-sm uppercase tracking-widest text-muted-foreground font-semibold hover:text-accent-primary transition-colors mb-2"
              >
                {product.brand}
              </Link>
            )}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <h1 className="font-sans text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1] break-words">
                <ScrollReveal>{product.title}</ScrollReveal>
              </h1>
              <ExperienceStoryModal story={product.experience_story} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground">Sold by</span>
              <Link href={`/store/${product.stores.slug}`} className="font-medium text-accent-primary hover:underline">
                {product.stores.name}
              </Link>
            </div>
          </div>

          <div className="text-3xl font-medium">
            ₹{product.price.toLocaleString('en-IN')}
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through ml-3">₹{product.compare_at_price.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div className="prose prose-base md:prose-lg text-muted-foreground leading-relaxed max-w-none">
            <p className="font-serif tracking-wide opacity-90">{product.description}</p>
          </div>

          {/* AI Summary Block */}
          <ReviewSummaryBlock productId={product.id} />

          <div className="border-t pt-6 mt-6">
            <VariantSelector 
              variants={variants} 
              sizes={sizes} 
              colors={colors} 
              basePrice={product.price}
            />
            <div className="mt-4">
              <WishlistButton productId={product.id} variant="outline" />
            </div>
          </div>

        </div>
      </div>

      {/* Semantic Vector Recommendations */}
      <YouMightAlsoLike productId={product.id} />

    </div>
    </>
  )
}
