'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateRefundStatus } from '@/app/actions/oms'
import toast from 'react-hot-toast'

export default function RefundsClient({ refunds }: { refunds: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (refundId: string, newStatus: string) => {
    setIsUpdating(refundId)
    try {
      const res = await updateRefundStatus(refundId, newStatus)
      if (res.success) toast.success('Refund status updated')
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="rounded-md border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                No refund requests.
              </TableCell>
            </TableRow>
          ) : (
            refunds.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold">
                  {item.orders?.order_group_id?.split('-')[0] || item.orders?.id?.split('-')[0]}
                </TableCell>
                <TableCell>{new Date(item.requested_at).toLocaleDateString()}</TableCell>
                <TableCell>{item.profiles?.name}</TableCell>
                <TableCell className="font-medium">₹{item.amount}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs" title={item.reason}>{item.reason}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={item.status} 
                    onValueChange={(val) => handleStatusChange(item.id, val)}
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
