import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RefundsClient from './RefundsClient'

export default async function SellerRefundsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  const { data: refunds } = await supabase
    .from('refunds')
    .select('id, amount, reason, status, requested_at, orders!inner ( id, order_group_id, store_id ), profiles ( name, email )')
    .eq('orders.store_id', store.id)
    .order('requested_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Manage refund requests for your products.</p>
      </div>

      <RefundsClient refunds={refunds || []} />
    </div>
  )
}
