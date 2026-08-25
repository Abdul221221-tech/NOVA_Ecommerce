import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ShopFilterDrawer } from '@/components/storefront/ShopFilterDrawer'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getSearchCorrection } from '@/app/actions/search'
import Link from 'next/link'
import { X } from 'lucide-react'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()

  // Extract params
  const params = await searchParams
  const category = params?.category as string
  const brand = params?.brand as string
  const minPrice = params?.min_price as string
  const maxPrice = params?.max_price as string
  const store = params?.store as string
  const color = params?.color as string
  const size = params?.size as string
  const q = params?.q as string

  // Build query
  let query = supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, brand, description,
      categories!inner ( id, name, slug ),
      stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
      product_images ( url, sort_order ),
      reviews ( rating ),
      product_variants ( id, size, color )
      ${(color || size) ? `, product_variants!inner(color, size)` : ''}
    `)
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .order('created_at', { ascending: false })

  // Parse multi-select arrays
  const catArray = category ? category.split(',').filter(Boolean) : []
  const brandArray = brand ? brand.split(',').filter(Boolean) : []

  // Apply Filters
  if (catArray.length > 0) query = query.in('categories.slug', catArray)
  if (brandArray.length > 0) query = query.in('brand', brandArray)
  if (minPrice) query = query.gte('price', parseFloat(minPrice))
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
  if (store) query = query.ilike('stores.name', `%${store}%`)
  if (color) query = query.ilike('product_variants.color', color)
  if (size) query = query.ilike('product_variants.size', size)
  
  let suggestedCorrection = null
  // Keyword Fallback (Fuzzy Search via RPC if q exists)
  if (q) {
    const qNorm = q.trim().toLowerCase()

    // Step 1: Try fuzzy product search
    const { data: searchResults } = await supabase.rpc('search_products_fuzzy', { search_term: q })

    if (searchResults && searchResults.length > 0) {
      // Product fuzzy match found — use it
      query = query.in('id', searchResults.map((r: any) => r.id))
    } else {
      // Step 2: No product fuzzy match. Check if the query exactly matches
      // a category name or brand (case-insensitive) before suggesting a correction.
      const [{ data: matchedCats }, { data: matchedBrands }] = await Promise.all([
        supabase.from('categories').select('slug').ilike('name', qNorm).limit(1),
        supabase.from('products').select('brand').ilike('brand', qNorm).eq('status', 'active').limit(1),
      ])

      const matchedCatSlug = matchedCats?.[0]?.slug
      const matchedBrand = matchedBrands?.[0]?.brand

      if (matchedCatSlug) {
        // Query is a category name — filter products by that category slug
        query = query.ilike('categories.slug', matchedCatSlug)
      } else if (matchedBrand) {
        // Query is a brand name — filter products by that brand
        query = query.ilike('brand', matchedBrand)
      } else {
        // Step 3: Genuinely no match — try spell correction
        suggestedCorrection = await getSearchCorrection(q)

        if (suggestedCorrection) {
          // Run fuzzy search for the corrected term
          const { data: correctedResults } = await supabase.rpc('search_products_fuzzy', { search_term: suggestedCorrection })
          if (correctedResults && correctedResults.length > 0) {
            query = query.in('id', correctedResults.map((r: any) => r.id))
          } else {
            // Also try category/brand match for the corrected term
            const [{ data: corrCats }, { data: corrBrands }] = await Promise.all([
              supabase.from('categories').select('slug').ilike('name', suggestedCorrection).limit(1),
              supabase.from('products').select('brand').ilike('brand', suggestedCorrection).eq('status', 'active').limit(1),
            ])
            if (corrCats?.[0]?.slug) {
              query = query.ilike('categories.slug', corrCats[0].slug)
            } else if (corrBrands?.[0]?.brand) {
              query = query.ilike('brand', corrBrands[0].brand)
            } else {
              query = query.eq('id', '00000000-0000-0000-0000-000000000000')
            }
          }
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000')
        }
      }
    }
  }

  const { data: products } = await query

  // --- RECOMMENDATIONS LOGIC ---
  let recommendedProducts: any[] = []
  if (q || category || brand) {
    let recQuery = supabase
      .from('products')
      .select(`
        id, title, price, compare_at_price, brand, description,
        categories!inner ( id, name, slug ),
        stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
        product_images ( url, sort_order ),
        reviews ( rating ),
        product_variants ( id, size, color )
      `)
      .eq('status', 'active')
      .eq('stores.status', 'approved')
      .limit(10)

    if (products && products.length > 0) {
      const catSlug = (products[0] as any).categories?.slug
      const brandStr = (products[0] as any).brand
      if (catSlug) recQuery = recQuery.ilike('categories.slug', catSlug)
      else if (brandStr) recQuery = recQuery.ilike('brand', brandStr)
      
      const exactIds = products.map((p: any) => p.id)
      recQuery = recQuery.not('id', 'in', `(${exactIds.join(',')})`)
    } else {
      if (q) {
        const words = q.split(' ').filter(w => w.length > 2)
        if (words.length > 0) {
           recQuery = recQuery.or(`title.ilike.%${words[0]}%,brand.ilike.%${words[0]}%`)
        } else {
           recQuery = recQuery.order('created_at', { ascending: false })
        }
      } else if (category && catArray.length > 0) {
         recQuery = recQuery.ilike('categories.slug', catArray[0])
      } else if (brand && brandArray.length > 0) {
         recQuery = recQuery.ilike('brand', brandArray[0])
      }
    }
    
    let { data: recData } = await recQuery
    
    if (!recData || recData.length === 0) {
       const { data: fallback } = await supabase
         .from('products')
         .select(`
            id, title, price, compare_at_price, brand, description,
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
       recData = fallback
    }
    recommendedProducts = recData || []
  }
  // ------------------------------

  let activeChips: { type: string, label: string }[] = []
  
  if (catArray.length > 0) {
    const { data: catData } = await supabase.from('categories').select('name').in('slug', catArray)
    if (catData) catData.forEach(c => activeChips.push({ type: 'category', label: c.name }))
  }
  if (brandArray.length > 0) {
    brandArray.forEach(b => activeChips.push({ type: 'brand', label: b }))
  }
  if (q) {
    activeChips.push({ type: 'search', label: `"${q}"` })
  }
  if (minPrice || maxPrice) {
    activeChips.push({ type: 'price', label: `₹${minPrice || '0'}–₹${maxPrice || '...'}` })
  }

  const hasActiveFilters = !!(category || brand || q || minPrice || maxPrice || color || size || store)
  const hasRealFilters = activeChips.some(chip => chip.type !== 'search')
  const clearAllHref = q ? `/products?q=${encodeURIComponent(q)}` : '/products'

  return (
    <div className="container mx-auto px-4 md:px-8 xl:px-12 w-full max-w-[1600px] py-12 flex flex-col gap-8">
      
      {/* Header and Filter Drawer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-heading text-4xl font-bold">
              <ScrollReveal>{activeChips.length > 0 ? 'Active Filters' : 'All Products'}</ScrollReveal>
            </h1>
            
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {activeChips.map((chip, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                    {chip.label}
                  </span>
                ))}
                {hasRealFilters && (
                  <Link href={clearAllHref} className="text-sm ml-2 flex items-center gap-1 text-muted-foreground hover:text-accent-primary transition-colors bg-muted/30 px-3 py-1.5 rounded-full">
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </Link>
                )}
              </div>
            )}
          </div>

          {suggestedCorrection && (
            <div className="mt-4 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
              <p className="text-foreground">
                No exact matches for <span className="font-semibold">"{q}"</span>. 
                Did you mean <Link href={`/products?q=${suggestedCorrection}`} className="font-bold text-accent-primary hover:underline">"{suggestedCorrection}"</Link>?
              </p>
            </div>
          )}
          <p className="text-muted-foreground mt-2">{products?.length || 0} product{products?.length === 1 ? '' : 's'} found</p>
        </div>
        <ShopFilterDrawer />
      </div>

      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-12">
        {(!products || products.length === 0) ? (
          <div className="text-center text-muted-foreground py-16 bg-surface-base rounded-xl border">
            No products found matching your exact criteria.
            {recommendedProducts.length > 0 && " But you might like these!"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {products.map((product: any) => {
              const activePromo = product.stores?.promotions?.find((p: any) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
                const hasStarted = new Date(p.starts_at) <= new Date()
                return p.is_active && !isExpired && hasStarted
              })
              const badgeText = activePromo 
                ? (activePromo.discount_type === 'percentage' ? `${activePromo.value}% OFF` : `$${activePromo.value} OFF`)
                : undefined

              return (
                <SpotlightCard key={product.id}>
                  <ProductCard product={product} promoBadge={badgeText} />
                </SpotlightCard>
              )
            })}
          </div>
        )}

        {/* Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="flex flex-col gap-6 pt-8 border-t border-border/50">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {recommendedProducts.map((product: any) => {
                const activePromo = product.stores?.promotions?.find((p: any) => {
                  const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
                  const hasStarted = new Date(p.starts_at) <= new Date()
                  return p.is_active && !isExpired && hasStarted
                })
                const badgeText = activePromo 
                  ? (activePromo.discount_type === 'percentage' ? `${activePromo.value}% OFF` : `₹${activePromo.value} OFF`)
                  : undefined

                return (
                  <SpotlightCard key={`rec-${product.id}`}>
                    <ProductCard product={product} promoBadge={badgeText} />
                  </SpotlightCard>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
