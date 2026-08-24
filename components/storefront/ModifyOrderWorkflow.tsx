'use client'

import { useState, useMemo } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Map, HelpCircle, CheckCircle2, PackageX, RotateCcw, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { modifyOrderItems, OrderModificationRequest } from '@/app/actions/oms'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CANCEL_REASONS = ['Ordered by mistake', 'Found a better price', 'Changed my mind', 'Delivery taking too long', 'Wrong product ordered', 'Product no longer required', 'Seller asked me to cancel', 'Duplicate order', 'Other']
const RETURN_REASONS = ['Product damaged', 'Product defective/not working', 'Wrong product received', 'Missing parts/accessories', "Product doesn't match description", 'Size/fit issue', 'Quality issue', 'Product no longer required', 'Other']
const EXCHANGE_REASONS = ['Wrong size', 'Wrong variant', 'Damaged product', 'Defective product', 'Wrong product received', 'Missing parts', 'Quality issue']

export function ModifyOrderWorkflow({ order, variant = 'list' }: { order: any, variant?: 'list'|'detail' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Select Item, 2: Reason, 3: Preview/Confirm, 4: Success
  
  // State for items
  const [selectedItems, setSelectedItems] = useState<{id: string, quantity: number, max: number, variantId?: string}[]>([])
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Derived state
  const status = order.status
  const isPreShipment = ['pending', 'confirmed'].includes(status)
  const isDelivered = status === 'delivered'
  
  // Determine available action based on order state
  const actionType = useMemo<'cancel' | 'return' | 'exchange' | null>(() => {
    if (isPreShipment) return 'cancel'
    if (isDelivered) {
      if (EXCHANGE_REASONS.includes(reason)) return 'exchange'
      return 'return' // default for post-delivery if not explicitly exchange
    }
    return null
  }, [isPreShipment, isDelivered, reason])

  // Extract previously cancelled/returned quantities
  const inactiveQuantities: Record<string, number> = useMemo(() => {
    const qtys: Record<string, number> = {}
    const parse = (records: any[]) => {
      records?.forEach(r => {
        try {
          const p = JSON.parse(r.note || '{}')
          if (p.items) p.items.forEach((i: any) => qtys[i.id] = (qtys[i.id] || 0) + (i.quantity || 1))
        } catch(e){}
      })
    }
    parse(order.cancellation_requests)
    parse(order.return_requests)
    parse(order.exchange_requests)
    return qtys
  }, [order])

  const availableItems = order.order_items?.map((item: any) => {
    const maxQty = item.quantity - (inactiveQuantities[item.id] || 0)
    return { ...item, maxQty }
  }).filter((item: any) => item.maxQty > 0) || []

  // Pre-calculations for preview
  const preview = useMemo(() => {
    let subtotalReduction = 0
    selectedItems.forEach(si => {
      const dbItem = order.order_items.find((i:any) => i.id === si.id)
      if (dbItem) subtotalReduction += (dbItem.price_at_purchase * si.quantity)
    })
    
    // Active subtotal BEFORE this request
    const currentActiveSubtotal = availableItems.reduce((acc: number, item: any) => acc + (item.price_at_purchase * item.maxQty), 0)
    const newActiveSubtotal = currentActiveSubtotal - subtotalReduction
    
    // Current shipping
    const currentShipping = order.shipping
    let newShipping = currentShipping
    
    if (newActiveSubtotal > 0) {
      newShipping = newActiveSubtotal >= 500 ? 0 : 50
    } else {
      newShipping = 0
    }
    
    const shippingPenalty = (currentShipping === 0 && newShipping > 0) ? newShipping : 0
    const refundAmount = Math.max(0, subtotalReduction - shippingPenalty)
    
    return { subtotalReduction, shippingPenalty, refundAmount, newActiveSubtotal }
  }, [selectedItems, order.order_items, availableItems, order.shipping])

  const handleNext = () => {
    if (step === 1 && selectedItems.length > 0) setStep(2)
    else if (step === 2 && reason) {
      if (!actionType) {
        toast.error('This action is not available for the current order status.')
        return
      }
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    if (!actionType) return
    setIsSubmitting(true)
    try {
      const req: OrderModificationRequest = {
        action: actionType,
        items: selectedItems.map(i => ({ id: i.id, quantity: i.quantity, variantId: i.variantId })),
        reason,
        note
      }
      const res = await modifyOrderItems(order.id, req)
      if (res.success) {
        setStep(4)
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to process request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setStep(1)
    setSelectedItems([])
    setReason('')
    setNote('')
  }

  const toggleItem = (item: any) => {
    const existing = selectedItems.find(i => i.id === item.id)
    if (existing) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, { id: item.id, quantity: item.maxQty, max: item.maxQty }])
    }
  }

  const updateItemQty = (id: string, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const canModify = isPreShipment || isDelivered

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

      {canModify && availableItems.length > 0 && (
        <Button 
          variant="outline" 
          onClick={() => { reset(); setOpen(true) }}
          className="rounded-full font-semibold border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-500/50 transition-all shadow-sm"
        >
          <HelpCircle className="w-4 h-4 mr-2" /> Modify Order
        </Button>
      )}

      <Dialog open={open} onOpenChange={(v) => !isSubmitting && setOpen(v)}>
        <DialogContent className="max-w-2xl">
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Select Items to Modify</DialogTitle>
                <DialogDescription>Which items do you need help with?</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {availableItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No eligible items remaining in this order.</div>
                ) : (
                  availableItems.map((item: any) => {
                    const isSelected = selectedItems.some(i => i.id === item.id)
                    const selectedData = selectedItems.find(i => i.id === item.id)
                    const product = item.product_variants?.products
                    const image = product?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url
                    
                    return (
                      <div key={item.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isSelected ? 'border-accent-primary bg-accent-primary/5' : 'border-border/50'}`}>
                        <div className="pt-2">
                          <input type="checkbox" className="size-5 rounded border-gray-300 text-accent-primary focus:ring-accent-primary" checked={isSelected} onChange={() => toggleItem(item)} />
                        </div>
                        <div className="relative size-16 rounded-lg overflow-hidden shrink-0 border border-border/30">
                          {image ? <Image src={image} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-muted/30" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm line-clamp-2">{product?.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">₹{item.price_at_purchase} each</div>
                        </div>
                        {isSelected && item.maxQty > 1 && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Qty:</Label>
                            <select 
                              className="border rounded p-1 text-sm bg-background"
                              value={selectedData?.quantity || 1}
                              onChange={(e) => updateItemQty(item.id, parseInt(e.target.value))}
                            >
                              {Array.from({length: item.maxQty}).map((_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={handleNext} disabled={selectedItems.length === 0} className="rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white">Next Step</Button>
              </DialogFooter>
            </>
          )}

          {step === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Reason for Request</DialogTitle>
                <DialogDescription>Please tell us why you are requesting a modification.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from(new Set([...CANCEL_REASONS, ...RETURN_REASONS, ...EXCHANGE_REASONS])).map(r => (
                    <Label 
                      key={r} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r ? 'border-accent-primary bg-accent-primary/10 shadow-sm' : 'border-border/50 hover:bg-muted/50'}`}
                    >
                      <RadioGroupItem value={r} className="data-[state=checked]:border-accent-primary data-[state=checked]:text-accent-primary" />
                      <span className={`font-medium text-sm ${reason === r ? 'text-accent-primary' : 'text-foreground'}`}>{r}</span>
                    </Label>
                  ))}
                </RadioGroup>
                
                {reason && isPreShipment && [...RETURN_REASONS, ...EXCHANGE_REASONS].includes(reason) && !CANCEL_REASONS.includes(reason) && reason !== 'Other' && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-500/20">
                    You cannot request a return or exchange for this reason before the item is delivered.
                  </div>
                )}

                {reason && isDelivered && CANCEL_REASONS.includes(reason) && !RETURN_REASONS.includes(reason) && reason !== 'Other' && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-500/20">
                    Cancellation is no longer allowed because this item has already been delivered.
                  </div>
                )}

                {reason === 'Other' && (
                  <Textarea placeholder="Please specify..." value={note} onChange={e => setNote(e.target.value)} className="mt-4 resize-none rounded-xl" rows={3} />
                )}
                
                {actionType === 'exchange' && reason !== 'Other' && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Replacement Details</Label>
                    <Textarea placeholder="Please specify the new size, color, or variant you'd like..." value={note} onChange={e => setNote(e.target.value)} className="resize-none rounded-xl" rows={2} />
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4 pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!reason || (reason === 'Other' && !note.trim()) || (isPreShipment && [...RETURN_REASONS, ...EXCHANGE_REASONS].includes(reason) && !CANCEL_REASONS.includes(reason) && reason !== 'Other') || (isDelivered && CANCEL_REASONS.includes(reason) && !RETURN_REASONS.includes(reason) && reason !== 'Other')} 
                  className="rounded-full"
                >
                  Review Request
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 3 && actionType && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl capitalize">Review {actionType} Request</DialogTitle>
                <DialogDescription>Please review the details of your request before confirming.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                  <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Items to {actionType}</div>
                  {selectedItems.map(si => {
                    const dbItem = order.order_items.find((i:any) => i.id === si.id)
                    return (
                      <div key={si.id} className="flex justify-between text-sm">
                        <span>{dbItem?.product_variants?.products?.title} <span className="text-muted-foreground ml-2">x{si.quantity}</span></span>
                        <span className="font-medium">₹{(dbItem?.price_at_purchase * si.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>

                {actionType !== 'exchange' && (
                  <div className="bg-background p-5 rounded-xl border shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Value</span>
                      <span>₹{preview.subtotalReduction.toLocaleString('en-IN')}</span>
                    </div>
                    {preview.shippingPenalty > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Shipping Deduction (Lost free shipping)</span>
                        <span>-₹{preview.shippingPenalty.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-3 mt-1">
                      <span>Total Refund Amount</span>
                      <span className="text-green-600 dark:text-green-400">₹{preview.refundAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
                
                {actionType === 'exchange' && (
                   <div className="bg-blue-50/50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm">
                      We will arrange a pickup for the selected items and ship the replacements once the pickup is verified. No refund is required.
                   </div>
                )}

              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">Back</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white shadow-md shadow-accent-primary/20"
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 4 && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="size-16 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-heading">Request Submitted!</h2>
              <p className="text-muted-foreground max-w-sm">
                Your request has been successfully processed. You can track the status in your order details.
              </p>
              <Button className="mt-4 rounded-full" onClick={() => { setOpen(false); reset(); }}>Done</Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  )
}
