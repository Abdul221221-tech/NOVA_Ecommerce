'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateReturnExchangeStatus } from '@/app/actions/oms'
import toast from 'react-hot-toast'

export default function ExchangesClient({ exchanges }: { exchanges: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string, orderId: string) => {
    setIsUpdating(id)
    try {
      const res = await updateReturnExchangeStatus('exchange', id, newStatus, orderId)
      if (res.success) toast.success('Exchange status updated')
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="rounded-md border bg-card mt-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exchanges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                No exchange requests.
              </TableCell>
            </TableRow>
          ) : (
            exchanges.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold">
                  {item.orders?.order_group_id?.split('-')[0] || item.orders?.id?.split('-')[0]}
                </TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{item.profiles?.name}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={item.order_items?.product_variants?.products?.title}>
                  {item.order_items?.quantity}x {item.order_items?.product_variants?.products?.title}
                </TableCell>
                <TableCell className="font-medium text-xs">{item.reason}</TableCell>
                <TableCell className="max-w-[150px] truncate text-xs" title={item.note}>{item.note || '-'}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={item.status} 
                    onValueChange={(val) => handleStatusChange(item.id, val, item.orders.id)}
                    disabled={isUpdating === item.id}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
