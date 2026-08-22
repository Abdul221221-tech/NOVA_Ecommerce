'use client'

import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { XCircle, RefreshCcw, Undo2, Map, ExternalLink, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { cancelOrder, submitReturnRequest, submitExchangeRequest } from '@/app/actions/oms'
import { useRouter } from 'next/navigation'

interface OrderActionButtonsProps {
  order: any
  variant?: 'list' | 'detail'
}

export function OrderActionButtons({ order, variant = 'list' }: OrderActionButtonsProps) {
  const router = useRouter()
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false)

  const [cancelReason, setCancelReason] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [returnReason, setReturnReason] = useState('')
  const [returnNote, setReturnNote] = useState('')
  const [selectedOrderItem, setSelectedOrderItem] = useState<string>('')
  
  const [exchangeReason, setExchangeReason] = useState('')
  const [exchangeNote, setExchangeNote] = useState('')
  // For simplicity, we just use a placeholder variant ID or let them specify note. 
  // In a real app we'd fetch actual variants here.
  const [requestedVariant, setRequestedVariant] = useState('placeholder-variant-id')

  const status = order.status

  const handleCancel = async () => {
    if (!cancelReason) return toast.error('Please select a reason')
    setIsSubmitting(true)
    try {
      const res = await cancelOrder(order.id, cancelReason, cancelNote)
      if (res.success) {
        toast.success('Order cancelled successfully')
        setCancelModalOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to cancel order')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturn = async () => {
    if (!returnReason) return toast.error('Please select a reason')
    if (!selectedOrderItem) return toast.error('Please select an item to return')
    setIsSubmitting(true)
    try {
      const res = await submitReturnRequest(order.id, selectedOrderItem, returnReason, returnNote)
      if (res.success) {
        toast.success('Return request submitted')
        setReturnModalOpen(false)
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit return request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExchange = async () => {
    if (!exchangeReason) return toast.error('Please select a reason')
    if (!selectedOrderItem) return toast.error('Please select an item to exchange')
    setIsSubmitting(true)
    try {
      // Since we don't have a variant selector implemented deeply yet, we pass a placeholder.
      // The note will carry the actual requested change.
      const res = await submitExchangeRequest(order.id, selectedOrderItem, order.order_items[0].product_variants?.id || 'placeholder', exchangeReason, exchangeNote)
      if (res.success) {
        toast.success('Exchange request submitted')
        setExchangeModalOpen(false)
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit exchange request')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Define valid states
  const canCancel = ['pending', 'confirmed'].includes(status)
  const canTrack = ['shipped', 'out_for_delivery'].includes(status)
  const canReturnExchange = ['delivered'].includes(status)
  const isCancelled = status === 'cancelled'
  const isReturnRequested = status === 'return_requested'
  const isExchangeRequested = status === 'exchange_requested'

  return (
    <div className={`flex flex-wrap gap-3 ${variant === 'detail' ? 'w-full' : 'justify-end'}`}>
      
      {variant === 'list' && (
        <Link 
          href={`/account/orders/${order.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full font-semibold border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-500/50 transition-all group/btn shadow-sm")}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
        </Link>
      )}

      {canCancel && (
        <Button variant="outline" className="rounded-full font-semibold border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/50 transition-all shadow-sm" onClick={() => setCancelModalOpen(true)}>
          <XCircle className="w-4 h-4 mr-2" /> Cancel Order
        </Button>
      )}

      {canTrack && (
        <Button variant="outline" className="rounded-full font-semibold border-blue-500/20 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-sm">
          <Map className="w-4 h-4 mr-2" /> Track Order
        </Button>
      )}

      

      {isCancelled && variant === 'detail' && (
        <Button variant="outline" className="rounded-full" disabled>Refund Status</Button>
      )}
      {isReturnRequested && variant === 'detail' && (
        <Button variant="outline" className="rounded-full" disabled>Return Status</Button>
      )}
      {isExchangeRequested && variant === 'detail' && (
        <Button variant="outline" className="rounded-full" disabled>Exchange Status</Button>
      )}

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold font-heading">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              Cancel Order?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              Are you sure you want to cancel this order?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-5 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] pr-2 -mr-2">
            {order.order_items?.[0] && (
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="relative size-12 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm border border-border/30">
                  <Image 
                    src={order.order_items[0].product_variants?.products?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url || '/placeholder.png'} 
                    alt="Product" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm line-clamp-1">{order.order_items[0].product_variants?.products?.title || 'Unknown Product'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Order #{order.order_group_id.split('-')[0]}</div>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-3 block font-semibold text-slate-700 dark:text-slate-200">Why are you cancelling this order?</Label>
              <RadioGroup onValueChange={setCancelReason} value={cancelReason} className="space-y-3">
                {['Ordered by mistake', 'Found a better price', 'Changed my mind', 'Product no longer required', 'Delivery taking too long', 'Wrong product ordered', 'Other'].map(r => (
                  <Label 
                    htmlFor={`cancel-${r}`} 
                    key={r}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      cancelReason === r 
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10 shadow-sm' 
                        : 'border-border hover:bg-muted/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <RadioGroupItem value={r} id={`cancel-${r}`} className="data-[state=checked]:border-red-500 data-[state=checked]:text-red-500" />
                    <span className={`font-medium ${cancelReason === r ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {r}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              
              {cancelReason === 'Other' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                  <Textarea 
                    className="w-full resize-none rounded-xl border-border focus-visible:ring-red-500/50 focus-visible:border-red-500 transition-all" 
                    placeholder="Please explain your reason..." 
                    rows={3}
                    value={cancelNote} 
                    onChange={(e) => setCancelNote(e.target.value)} 
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setCancelModalOpen(false)}>Keep Order</Button>
            <Button 
              className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 font-bold transition-all disabled:opacity-50" 
              onClick={handleCancel} 
              disabled={isSubmitting || !cancelReason}
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Product</DialogTitle>
            <DialogDescription>Why do you want to return this product?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] pr-2 -mr-2">
            <div>
              <Label className="mb-2 block">Select Product to Return</Label>
              <Select onValueChange={(val) => setSelectedOrderItem(val || '')} value={selectedOrderItem}>
                <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                <SelectContent>
                  {order.order_items?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.product_variants?.products?.title} (Qty: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Reason for Return</Label>
              <Select onValueChange={(val) => setReturnReason(val || '')} value={returnReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {['Product damaged', 'Wrong product received', 'Product doesn\'t match description', 'Size/fit issue', 'Quality issue', 'Missing item/accessory', 'Changed my mind', 'Other'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnReason && (
              <div>
                <Label className="mb-2 block">Additional notes</Label>
                <Textarea value={returnNote} onChange={e => setReturnNote(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReturn} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exchange Modal */}
      <Dialog open={exchangeModalOpen} onOpenChange={setExchangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exchange Product</DialogTitle>
            <DialogDescription>Request a replacement or variant exchange.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] pr-2 -mr-2">
            <div>
              <Label className="mb-2 block">Select Product to Exchange</Label>
              <Select onValueChange={(val) => setSelectedOrderItem(val || '')} value={selectedOrderItem}>
                <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                <SelectContent>
                  {order.order_items?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.product_variants?.products?.title} (Qty: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Reason for Exchange</Label>
              <Select onValueChange={(val) => setExchangeReason(val || '')} value={exchangeReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {['Wrong size', 'Wrong color', 'Damaged product', 'Wrong product received', 'Quality issue', 'Other'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {exchangeReason && (
              <div>
                <Label className="mb-2 block">Exchange Details (New Size/Color)</Label>
                <Textarea placeholder="E.g., Need Size L in Black" value={exchangeNote} onChange={e => setExchangeNote(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExchangeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExchange} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Exchange Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
