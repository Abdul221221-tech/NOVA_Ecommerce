import { createClient } from '@/lib/supabase/server'
import { AdminProductsClient } from './AdminProductsClient'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, price, stock, approval_status, status, created_at,
      stores ( name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage all products across the platform.</p>
      </div>

      <AdminProductsClient initialProducts={(products as any) || []} />
    </div>
  )
}
