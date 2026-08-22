'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrderStatusWithHistory } from '@/app/actions/oms'
import toast from 'react-hot-toast'

export default function CancellationsClient({ cancellations }: { cancellations: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string | undefined | null, newStatus: string) => {
    if (!orderId) return;
    setIsUpdating(orderId)
    try {
      const res = await updateOrderStatusWithHistory(orderId, newStatus, 'Cancellation ' + newStatus)
      if (res.success) toast.success('Order status updated')
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cancellations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                No cancellation requests.
              </TableCell>
            </TableRow>
          ) : (
            cancellations.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold">
                  {item.orders?.order_group_id?.split('-')[0] || item.orders?.id?.split('-')[0]}
                </TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{item.profiles?.name}</TableCell>
                <TableCell className="font-medium text-xs">{item.reason}</TableCell>
                <TableCell className="max-w-[150px] truncate text-xs" title={item.note}>{item.note || '-'}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue="pending" 
                    onValueChange={(val) => handleStatusChange(String(item.orders?.id), val || '')}
                    disabled={isUpdating === String(item.orders?.id)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cancelled">Approve Cancel</SelectItem>
                      <SelectItem value="processing">Reject (Process)</SelectItem>
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
