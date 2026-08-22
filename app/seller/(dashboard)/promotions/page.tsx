import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PromotionsClient from './PromotionsClient'

export default async function SellerPromotionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  const { data: promotions } = await supabase
    .from('promotions')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes for your store.</p>
        </div>
        <Link href="/seller/promotions/new">
          <Button>Create Promotion</Button>
        </Link>
      </div>

      <PromotionsClient promotions={promotions || []} />
    </div>
  )
}
