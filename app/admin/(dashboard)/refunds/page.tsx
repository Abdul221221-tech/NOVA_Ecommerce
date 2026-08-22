import { createClient } from '@/lib/supabase/server'
import RefundsExchangesClient from './RefundsExchangesClient'

export default async function AdminRefundsExchangesPage() {
  const supabase = await createClient()
  
  const { data: returns } = await supabase
    .from('return_requests')
    .select(`
      *,
      orders ( id, order_group_id, total, stores(name) ),
      order_items ( quantity, price_at_purchase, product_variants ( products ( title ) ) ),
      profiles ( name, email )
    `)
    .order('created_at', { ascending: false })

  const { data: exchanges } = await supabase
    .from('exchange_requests')
    .select(`
      *,
      orders ( id, order_group_id, total, stores(name) ),
      order_items ( quantity, price_at_purchase, product_variants ( products ( title ) ) ),
      profiles ( name, email )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Refunds & Exchanges</h1>
        <p className="text-muted-foreground">Manage customer return and exchange requests across all sellers.</p>
      </div>

      <RefundsExchangesClient returns={(returns as any) || []} exchanges={(exchanges as any) || []} />
    </div>
  )
}
