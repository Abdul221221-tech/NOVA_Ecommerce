import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-2xl min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-heading text-4xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">We couldn't find the category you're looking for. It may have been removed or the link might be broken.</p>
        <Link href="/products">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Browse All Products
          </Button>
        </Link>
      </div>
    )
  }

  // Fetch active products in this category from approved stores
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, brand, description,
      categories!inner ( id, name, slug ),
      stores!inner ( name, slug, status, promotions ( code, discount_type, value, is_active, starts_at, expires_at ) ),
      product_images ( url, sort_order ),
      reviews ( rating ),
      product_variants ( id, size, color )
    `)
    .eq('category_id', category.id)
    .eq('status', 'active')
    .eq('stores.status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">Browse all {category.name.toLowerCase()} across our marketplace.</p>
      </div>
      
      {/* Filters (Client Component Placeholder) */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm font-medium">Filters:</span>
        <div className="px-3 py-1 rounded-full border bg-muted/20 text-sm cursor-pointer hover:bg-muted/50">Price</div>
        <div className="px-3 py-1 rounded-full border bg-muted/20 text-sm cursor-pointer hover:bg-muted/50">Size</div>
        <div className="px-3 py-1 rounded-full border bg-muted/20 text-sm cursor-pointer hover:bg-muted/50">Color</div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="text-center text-muted-foreground py-16 bg-muted/10 rounded-md">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
