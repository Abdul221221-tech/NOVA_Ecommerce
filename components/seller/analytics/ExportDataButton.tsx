'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportDataButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // 1. Define CSV Headers
    const headers = ['Order ID', 'Date', 'Status', 'Total', 'Seller Payout', 'Items']
    
    // 2. Map data to rows
    const rows = data.map(order => {
      const itemsString = order.order_items.map((i:any) => `${i.quantity}x ${i.product_variants?.products?.title}`).join(' | ')
      return [
        order.id,
        new Date(order.created_at).toISOString(),
        order.status,
        order.total,
        order.seller_payout,
        `"${itemsString.replace(/"/g, '""')}"` // Escape quotes for CSV
      ]
    })

    // 3. Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n')

    // 4. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `nova_sales_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" /> Export CSV
    </Button>
  )
}
