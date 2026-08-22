import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReturnsClient from './ReturnsClient'

export default async function SellerReturnsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Fetch Return Requests
  const { data: returnRequests } = await supabase
    .from('return_requests')
    .select(`
      id, reason, note, status, created_at,
      orders!inner ( id, order_group_id, store_id ),
      order_items ( quantity, product_variants ( products ( title ) ) ),
      profiles ( name, email )
    `)
    .eq('orders.store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Returns</h1>
        <p className="text-muted-foreground">Manage incoming return requests for your products.</p>
      </div>

      <ReturnsClient returns={returnRequests || []} />
    </div>
  )
}
