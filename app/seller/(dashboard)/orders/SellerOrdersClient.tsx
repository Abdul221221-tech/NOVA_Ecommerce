'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { updateOrderStatusWithHistory } from '@/app/actions/oms'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/seller/EmptyState'

const MotionTableRow = motion(TableRow)

export default function SellerOrdersClient({ orders }: { orders: any[] }) {
  const prefersReducedMotion = useReducedMotion()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [successStatus, setSuccessStatus] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId)
    setSuccessStatus(null)
    try {
      await updateOrderStatusWithHistory(orderId, newStatus)
      setSuccessStatus(orderId)
      setTimeout(() => setSuccessStatus(null), 2000)
    } catch (e) {
      console.error(e)
      alert("Failed to update status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payout</TableHead>
            <TableHead className="w-[180px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 border-none">
                <EmptyState 
                  icon={ShoppingCart} 
                  title="No orders yet" 
                  description="When customers place orders for your products, they will appear here."
                />
              </TableCell>
            </TableRow>
          ) : (
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => {
                const delay = Math.min(index * 0.04, 0.4)
                return (
                  <MotionTableRow 
                    key={order.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay }}
                    className="group hover:bg-accent-primary/5 transition-colors duration-200"
                  >
                    <TableCell className="font-mono text-xs">
                      <Link href={`/seller/orders/${order.id}`} className="text-accent-primary hover:underline font-bold">
                        {order.id.split('-')[0]}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ul className="text-sm text-muted-foreground list-none space-y-1">
                        {order.order_items.map((item: any) => (
                          <li key={item.id} className="flex items-center gap-2 truncate max-w-[200px]">
                            <span className="font-medium text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">x{item.quantity}</span> 
                            {item.product_variants?.products?.title}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="font-medium">₹{Number(order.total).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-status-success font-bold bg-status-success/5 rounded-md px-2 py-1 inline-block mt-2 border border-status-success/20">
                      ₹{Number(order.seller_payout).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center">
                        <Select 
                          defaultValue={order.status} 
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                          disabled={isUpdating === order.id}
                        >
                          <SelectTrigger className={`w-[140px] transition-all focus:ring-accent-primary ${isUpdating === order.id ? 'opacity-50' : ''} ${successStatus === order.id ? 'border-status-success ring-1 ring-status-success' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending (Placed)</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="packed">Packed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled" disabled>Cancelled</SelectItem>
                            <SelectItem value="return_requested" disabled>Return Req.</SelectItem>
                            <SelectItem value="exchange_requested" disabled>Exchange Req.</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <AnimatePresence>
                          {isUpdating === order.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 10 }}
                              exit={{ opacity: 0, scale: 0.5, x: 10 }}
                              className="absolute right-[-24px]"
                            >
                              <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
                            </motion.div>
                          )}
                          {successStatus === order.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 10 }}
                              exit={{ opacity: 0, scale: 0.5, x: 10 }}
                              className="absolute right-[-24px]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-status-success" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </TableCell>
                  </MotionTableRow>
                )
              })}
            </AnimatePresence>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
