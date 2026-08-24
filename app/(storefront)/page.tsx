import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { PersonalizedFeed } from '@/components/storefront/PersonalizedFeed'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { HeroCarousel } from '@/components/storefront/HeroCarousel'
import { CategoryScroller } from '@/components/storefront/CategoryScroller'
import { BrandScroller } from '@/components/storefront/BrandScroller'
import { ProductCarousel } from '@/components/storefront/ProductCarousel'
import { TabbedProductCarousel } from '@/components/storefront/TabbedProductCarousel'
import { ArrowRight } from 'lucide-react'

const categoryImages: Record<string, string> = {
  'footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'apparel-men': 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80',
  'apparel-women': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  'accessories': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
  'bags': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
  'home-living': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
  'electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
}

export default async function StorefrontHome() {
  const supabase = await createClient()

  // 1. Fetch Categories (Only those with active products)
  const { data: catProducts } = await supabase.from('products').select('category_id').eq('status', 'active').not('category_id', 'is', null)
  const activeCatIds = new Set(catProducts?.map(p => p.category_id))
  
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const activeCategories = (categories || []).filter(c => activeCatIds.has(c.id))

  // 1b. Fetch Category Representative Images
  const categoriesWithImages = activeCategories.length > 0 ? await Promise.all(activeCategories.map(async (cat) => {
    const { data } = await supabase
      .from('products')
      .select('product_images(url)')
      .eq('categories.slug', cat.slug)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: data?.product_images?.[0]?.url || categoryImages[cat.slug] || categoryImages['accessories']
    }
  })) : []

  // 1c. Fetch Distinct Brands
  const { data: brandProds } = await supabase.from('products').select('brand').eq('status', 'active').not('brand', 'is', null)
  const uniqueBrands = brandProds ? (Array.from(new Set(brandProds.map(p => p.brand).filter(Boolean))) as string[]).sort() : []

  // 2. Fetch "Just Arrived" (Recent 10) - Note: backend sort logic is currently created_at DESC
  const { data: justArrived } = await supabase
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
    .order('created_at', { ascending: false })
    .limit(10)

  // 3. Fetch "Best Selling" - Note: backend sort logic is currently price DESC as a proxy for premium/best-selling
  const { data: bestSelling } = await supabase
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
    .order('price', { ascending: false })
    .limit(10)

  // 4. Fetch "Trending" - Note: backend sort logic is currently random/featured proxy (e.g. by title) for variety to support tabs
  const { data: trending } = await supabase
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
    .order('title', { ascending: true })
    .limit(20)

  // 4. Fetch Hero & Promo Images
  const fetchHeroProduct = async (categorySlug: string) => {
    const { data } = await supabase
      .from('products')
      .select(`id, categories!inner(slug), product_images(url)`)
      .eq('categories.slug', categorySlug)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.product_images?.[0]?.url || categoryImages[categorySlug]
  }

  const [
    heroFootwearUrl,
    heroApparelUrl,
    heroHomeUrl,
    promoAccessoriesUrl,
    promoElectronicsUrl
  ] = await Promise.all([
    fetchHeroProduct('footwear'),
    fetchHeroProduct('apparel-men'),
    fetchHeroProduct('home-living'),
    fetchHeroProduct('accessories'),
    fetchHeroProduct('electronics')
  ])

  const heroSlides = [
    {
      id: 'slide-1',
      headline: 'Step into Comfort',
      description: 'Discover premium footwear crafted for everyday performance and style.',
      ctaText: 'Shop Footwear',
      href: '/categories/footwear',
      imageUrl: heroFootwearUrl
    },
    {
      id: 'slide-2',
      headline: 'Elevate Your Wardrobe',
      description: 'Explore the latest in mens apparel from independent designers.',
      ctaText: 'Shop Apparel',
      href: '/categories/apparel-men',
      imageUrl: heroApparelUrl
    },
    {
      id: 'slide-3',
      headline: 'Refresh Your Space',
      description: 'Curated home goods to transform your living environment.',
      ctaText: 'Shop Home & Living',
      href: '/categories/home-living',
      imageUrl: heroHomeUrl
    }
  ]

  return (
    <div className="flex flex-col items-center">
      
      {/* Hero & Promo Section */}
      <section className="w-full bg-background pt-4 pb-12">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-auto lg:h-[600px]">
            {/* Main Carousel (Spans 2 columns) */}
            <div className="lg:col-span-2 h-[500px] lg:h-full">
              <HeroCarousel slides={heroSlides} />
            </div>
            
            {/* Side Promo Tiles (Stacked) */}
            <div className="flex flex-col gap-4 lg:gap-6 h-auto lg:h-full">
              {/* Promo Tile 1 */}
              <Link href="/categories/accessories" className="relative flex-1 rounded-2xl overflow-hidden group min-h-[240px] lg:min-h-0 bg-muted">
                <Image
                  src={promoAccessoriesUrl}
                  alt="Accessories Promo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">Essential Accessories</h3>
                  <div className="flex items-center text-white/90 font-medium group-hover:text-white transition-colors">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>

              {/* Promo Tile 2 */}
              <Link href="/categories/electronics" className="relative flex-1 rounded-2xl overflow-hidden group min-h-[240px] lg:min-h-0 bg-muted">
                <Image
                  src={promoElectronicsUrl}
                  alt="Electronics Promo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">Next-Gen Tech</h3>
                  <div className="flex items-center text-white/90 font-medium group-hover:text-white transition-colors">
                    Upgrade Now <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Shop by Category Row */}
      <section className="w-full py-20 bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-heading text-4xl font-bold">
              <ScrollReveal>Shop by Category</ScrollReveal>
            </h2>
            <Link href="/categories" className="text-accent-primary font-medium hover:underline hidden sm:block">View all &rarr;</Link>
          </div>
          
          <CategoryScroller categories={categoriesWithImages} />
        </div>
      </section>

      {/* Shop by Brand Row */}
      {uniqueBrands.length > 0 && (
        <section className="w-full pb-20 bg-background">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
            <div className="flex justify-between items-end mb-10">
              <h2 className="font-heading text-4xl font-bold">
                <ScrollReveal>Shop by Brand</ScrollReveal>
              </h2>
            </div>
            
            <BrandScroller brands={uniqueBrands} />
          </div>
        </section>
      )}

      {/* Trending (Tabbed Carousel) */}
      <section className="w-full py-20 bg-muted/20 overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-heading text-4xl font-bold">
              <ScrollReveal>Trending Now</ScrollReveal>
            </h2>
            <Link href="/products" className="text-accent-primary font-medium hover:underline">Shop all &rarr;</Link>
          </div>
          <TabbedProductCarousel products={trending || []} />
        </div>
      </section>

      {/* Just Arrived Carousel */}
      <section className="w-full py-20 bg-background overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-heading text-4xl font-bold">
              <ScrollReveal>Just Arrived</ScrollReveal>
            </h2>
            <Link href="/products" className="text-accent-primary font-medium hover:underline">Shop all &rarr;</Link>
          </div>
          <ProductCarousel products={justArrived || []} promoBadge="NEW" />
        </div>
      </section>

      {/* AI Personalized Feed based on The Thread */}
      <PersonalizedFeed />

      {/* Best Selling Carousel */}
      <section className="w-full py-20 bg-muted/20 overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-heading text-4xl font-bold">
              <ScrollReveal>Best Selling</ScrollReveal>
            </h2>
            <Link href="/products" className="text-accent-primary font-medium hover:underline">Shop all &rarr;</Link>
          </div>
          <ProductCarousel products={bestSelling || []} />
        </div>
      </section>
      
    </div>
  )
}

