import { createClient } from '@/lib/supabase/server'
import { AdminProductsClient } from './AdminProductsClient'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: rawProducts } = await supabase
    .from('products')
    .select(`
      id, title, price, approval_status, status, created_at,
      stores ( name ),
      product_variants ( stock_quantity )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Transform data to match client expectations and fix schema mismatches
  const products = (rawProducts || []).map((p: any) => {
    const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;
    return {
      id: p.id,
      name: p.title, // Map 'title' to 'name' for the client
      price: p.price,
      stock: totalStock,
      approval_status: p.approval_status,
      status: p.status,
      created_at: p.created_at,
      stores: p.stores
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage all products across the platform.</p>
      </div>

      <AdminProductsClient initialProducts={products} />
    </div>
  )
}
