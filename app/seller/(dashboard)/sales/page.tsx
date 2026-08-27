import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, DollarSign, Download, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function SalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')

  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Fetch orders (Net Sales)
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_group_id, created_at, status, seller_payout, total')
    .eq('store_id', store.id)
    .in('status', ['paid', 'packed', 'shipped', 'out_for_delivery', 'delivered'])
    .order('created_at', { ascending: false })

  const validOrders = orders || []
  const netSales = validOrders.reduce((sum, o) => sum + Number(o.seller_payout || 0), 0)
  const aov = validOrders.length > 0 ? netSales / validOrders.length : 0

  // Fetch refunds
  const { data: refunds } = await supabase
    .from('refunds')
    .select('id, amount, status, requested_at, orders!inner(store_id, order_group_id)')
    .eq('orders.store_id', store.id)
    .order('requested_at', { ascending: false })

  const validRefunds = refunds || []
  const totalRefunds = validRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0)

  // Merge for the ledger table
  const ledger = [
    ...validOrders.map(o => ({
      id: o.id,
      date: o.created_at,
      description: `Order #${o.order_group_id.split('-')[0]}`,
      type: 'Sale',
      amount: Number(o.seller_payout),
      status: o.status
    })),
    ...validRefunds.map(r => ({
      id: r.id,
      date: r.requested_at,
      description: `Refund for Order #${(r.orders as any).order_group_id.split('-')[0]}`,
      type: 'Refund',
      amount: -Number(r.amount),
      status: r.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Overview</h2>
          <p className="text-muted-foreground mt-2">Detailed breakdown of your store's revenue.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">?{netSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on {validOrders.length} valid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">?{totalRefunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{validRefunds.length} processed refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">?{aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Net sales per order</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>A list of your recent payouts and settled transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          tx.type === 'Sale' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{tx.status}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {tx.amount < 0 ? '-' : ''}?{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
