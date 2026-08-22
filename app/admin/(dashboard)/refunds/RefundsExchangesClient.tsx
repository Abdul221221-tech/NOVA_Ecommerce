'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateReturnExchangeStatus } from '@/app/actions/oms'
import toast from 'react-hot-toast'

export default function RefundsExchangesClient({ returns, exchanges }: { returns: any[], exchanges: any[] }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (type: 'return' | 'exchange', id: string, newStatus: string, orderId: string) => {
    setIsUpdating(id)
    try {
      const res = await updateReturnExchangeStatus(type, id, newStatus, orderId)
      if (res.success) toast.success(`${type} status updated`)
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    } finally {
      setIsUpdating(null)
    }
  }

  const renderTable = (data: any[], type: 'return' | 'exchange') => (
    <div className="rounded-md border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold truncate max-w-[80px]">
                  {item.id.substring(0,8).toUpperCase()}
                </TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{item.profiles?.name}</TableCell>
                <TableCell>{item.orders?.stores?.name || 'N/A'}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={item.order_items?.product_variants?.products?.title}>
                  {item.order_items?.quantity}x {item.order_items?.product_variants?.products?.title}
                </TableCell>
                <TableCell className="font-medium text-xs">{item.reason}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={item.status} 
                    onValueChange={(val) => handleStatusChange(type, item.id, val, item.orders.id)}
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

  return (
    <Tabs defaultValue="returns">
      <TabsList className="mb-4">
        <TabsTrigger value="returns">Returns & Refunds ({returns.length})</TabsTrigger>
        <TabsTrigger value="exchanges">Exchanges ({exchanges.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="returns">
        {renderTable(returns, 'return')}
      </TabsContent>
      <TabsContent value="exchanges">
        {renderTable(exchanges, 'exchange')}
      </TabsContent>
    </Tabs>
  )
}
