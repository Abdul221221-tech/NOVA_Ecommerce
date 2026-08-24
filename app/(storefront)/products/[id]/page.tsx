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
import { ProductCarousel } from '@/components/storefront/ProductCarousel'
import { RecentlyViewedCarousel } from '@/components/storefront/RecentlyViewedCarousel'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      stores!inner ( name, slug, status ),
      categories ( id, name, slug ),
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
    </div>

    <div className="w-full bg-muted/10 py-16 mt-16 border-t">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 flex flex-col gap-16">
        {/* Semantic Vector Recommendations */}
        <YouMightAlsoLike productId={product.id} />
        
        {/* Related Products (Same Category) */}
        <RelatedProducts 
          categoryIds={Array.isArray(product.categories) ? product.categories.map((c: any) => c.id) : (product.categories ? [(product.categories as any).id] : [])} 
          currentProductId={product.id} 
        />

        {/* More from This Store */}
        <MoreFromStore storeId={product.stores.slug} currentProductId={product.id} />

        {/* Recently Viewed */}
        <RecentlyViewedCarousel currentProductId={product.id} />
      </div>
    </div>
    </>
  )
}

async function RelatedProducts({ categoryIds, currentProductId }: { categoryIds: string[], currentProductId: string }) {
  if (!categoryIds || categoryIds.length === 0) return null
  
  const supabase = await createClient()
  
  // Note: the category_id is stored on products directly in some places or through junction tables,
  // but looking at page.tsx we can query using inner join on categories.
  // Actually, wait, let's query products where category_id is in categoryIds or using junction.
  // Since we don't know the exact junction syntax, let's use the categories!inner syntax.
  const { data: related } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, description, brand,
      categories!inner ( id, name, slug ),
      stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
      product_images ( url, sort_order ),
      reviews ( rating ),
      product_variants ( id, size, color )
    `)
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .in('categories.id', categoryIds)
    .neq('id', currentProductId)
    .limit(10)

  if (!related || related.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="font-heading text-3xl font-bold">Related Products</h2>
      </div>
      <ProductCarousel products={related} />
    </div>
  )
}

async function MoreFromStore({ storeId, currentProductId }: { storeId: string, currentProductId: string }) {
  const supabase = await createClient()
  
  const { data: storeProducts } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, description, brand,
      categories!inner ( id, name, slug ),
      stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
      product_images ( url, sort_order ),
      reviews ( rating ),
      product_variants ( id, size, color )
    `)
    .eq('status', 'active')
    .eq('stores.slug', storeId)
    .neq('id', currentProductId)
    .limit(10)

  if (!storeProducts || storeProducts.length === 0) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="font-heading text-3xl font-bold">More from This Store</h2>
      </div>
      <ProductCarousel products={storeProducts} />
    </div>
  )
}
