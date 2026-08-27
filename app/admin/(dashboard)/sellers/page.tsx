import { createClient } from '@/lib/supabase/server'
import { AdminSellersClient } from './AdminSellersClient'

export default async function AdminSellersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const defaultStatus = params.status || 'all'

  const { data: stores } = await supabase
    .from('stores')
    .select(`
      id, name, description, status, created_at, suspension_reason, rejection_reason,
      profiles:owner_id ( email, name )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Sellers</h1>
        <p className="text-slate-400 mt-2">Manage marketplace sellers and review applications.</p>
      </div>

      <AdminSellersClient initialStores={(stores as any) || []} defaultStatus={defaultStatus} />
    </div>
  )
}
