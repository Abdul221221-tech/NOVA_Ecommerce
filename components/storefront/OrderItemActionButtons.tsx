'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2, RefreshCcw, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { submitReturnRequest, submitExchangeRequest } from '@/app/actions/oms'
import { useRouter } from 'next/navigation'

interface OrderItemActionButtonsProps {
  order: any
  item: any
  eligibility: {
    canReturn: boolean
    canExchange: boolean
    reason: string
    daysRemaining: number
  }
}

export function OrderItemActionButtons({ order, item, eligibility }: OrderItemActionButtonsProps) {
  const router = useRouter()
  
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [returnReason, setReturnReason] = useState('')
  const [returnNote, setReturnNote] = useState('')
  
  const [exchangeReason, setExchangeReason] = useState('')
  const [exchangeNote, setExchangeNote] = useState('')

  const handleReturn = async () => {
    if (!returnReason) return toast.error('Please select a reason')
    setIsSubmitting(true)
    try {
      const res = await submitReturnRequest(order.id, item.id, returnReason, returnNote)
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
    setIsSubmitting(true)
    try {
      const res = await submitExchangeRequest(order.id, item.id, item.product_variants?.id || 'placeholder', exchangeReason, exchangeNote)
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

  // If order is not delivered, don't show anything here.
  if (order.status !== 'delivered') return null;

  return (
    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
      {eligibility.canReturn || eligibility.canExchange ? (
        <div className="flex gap-2">
          {eligibility.canReturn && (
            <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs border-amber-500/20 text-amber-600 hover:bg-amber-50" onClick={() => setReturnModalOpen(true)}>
              <Undo2 className="w-3 h-3 mr-1" /> Return / Refund
            </Button>
          )}
          {eligibility.canExchange && (
            <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs border-blue-500/20 text-blue-600 hover:bg-blue-50" onClick={() => setExchangeModalOpen(true)}>
              <RefreshCcw className="w-3 h-3 mr-1" /> Exchange
            </Button>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" /> {eligibility.reason}
        </div>
      )}
      
      {eligibility.canReturn && <div className="text-[10px] text-muted-foreground">{eligibility.reason}</div>}

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return & Refund</DialogTitle>
            <DialogDescription>Why are you returning {item.product_variants?.products?.title}?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="mb-2 block">Reason for Return</Label>
              <Select onValueChange={(val) => setReturnReason(val || '')} value={returnReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {[
                    'Product is damaged', 
                    'Product is defective/not working', 
                    'Wrong product received', 
                    'Wrong size received', 
                    'Wrong color received', 
                    'Product does not match description', 
                    'Missing item/accessory', 
                    'Product quality issue', 
                    'Changed my mind', 
                    'No longer needed', 
                    'Other'
                  ].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnReason && (
              <div>
                <Label className="mb-2 block">Description (Optional)</Label>
                <Textarea placeholder="Please provide any additional details..." value={returnNote} onChange={e => setReturnNote(e.target.value)} />
              </div>
            )}
            {/* We could add image upload here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReturn} disabled={isSubmitting || !returnReason}>
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
            <DialogDescription>Request a replacement for {item.product_variants?.products?.title}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="mb-2 block">Reason for Exchange</Label>
              <Select onValueChange={(val) => setExchangeReason(val || '')} value={exchangeReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {[
                    'Wrong size', 
                    'Wrong color', 
                    'Damaged product', 
                    'Defective/not working', 
                    'Wrong product received', 
                    'Other'
                  ].map(r => (
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
            <Button onClick={handleExchange} disabled={isSubmitting || !exchangeReason}>
              {isSubmitting ? 'Submitting...' : 'Request Exchange'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
