'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateRefundStatus } from '@/app/actions/oms'
import toast from 'react-hot-toast'

export default function AdminRefundsClient({ refunds }: { refunds: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id)
    try {
      const res = await updateRefundStatus(id, newStatus)
      if (res.success) toast.success(`Refund status updated`)
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
            <TableHead>Date Requested</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                No refunds requested.
              </TableCell>
            </TableRow>
          ) : (
            refunds.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell className="font-mono text-xs font-bold">
                  {refund.orders?.order_group_id?.split('-')[0] || refund.orders?.id?.split('-')[0]}
                </TableCell>
                <TableCell>{new Date(refund.requested_at).toLocaleDateString()}</TableCell>
                <TableCell>{refund.profiles?.email}</TableCell>
                <TableCell className="font-medium">₹{Number(refund.amount).toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-xs truncate max-w-[200px]" title={refund.reason}>{refund.reason}</TableCell>
                <TableCell className="text-xs uppercase">{refund.refund_method}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={refund.status} 
                    onValueChange={(val) => handleStatusChange(refund.id, val)}
                    disabled={isUpdating === refund.id}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="initiated">Initiated</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
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
