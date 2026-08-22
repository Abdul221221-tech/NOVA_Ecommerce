'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function CheckoutForm({ orderGroupId, amount }: { orderGroupId: string, amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    // Stripe handles the confirmation and redirect
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_group_id=${orderGroupId}`,
      }
    })

    if (submitError) {
      setError(submitError.message || 'An unexpected error occurred.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-lg border-b pb-2">Shipping Information</h3>
        <AddressElement options={{ mode: 'shipping' }} />
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="font-medium text-lg border-b pb-2">Payment Details</h3>
        <PaymentElement />
      </div>

      {error && <div className="text-status-error text-sm font-medium">{error}</div>}

      <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full h-12 text-lg">
        {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
      </Button>
    </form>
  )
}

export default function CheckoutWrapper({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderGroupId, setOrderGroupId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(amount)
  const [isApplying, setIsApplying] = useState(false)

  const fetchIntent = (code: string | null = null) => {
    setIsApplying(true)
    fetch('/api/checkout/intent', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode: code })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setClientSecret(data.clientSecret)
        setOrderGroupId(data.orderGroupId)
        setDiscountAmount(data.discountAmount || 0)
        setFinalAmount(data.finalAmount || amount)
        if (code && data.discountAmount > 0) {
          setAppliedPromo(code)
          setPromoCode('')
        } else if (code) {
          setError('Promo code invalid or not applicable to these items.')
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsApplying(false))
  }

  useEffect(() => {
    // Fetch Intent on mount without promo
    fetchIntent()
  }, [])

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return
    setError(null)
    fetchIntent(promoCode)
  }

  return (
    <div className="space-y-6">
      {!appliedPromo && (
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input 
            type="text" 
            value={promoCode} 
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Promo code" 
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={isApplying || !promoCode.trim()} variant="secondary">
            {isApplying ? 'Applying...' : 'Apply'}
          </Button>
        </form>
      )}

      {appliedPromo && (
        <div className="flex justify-between items-center text-status-success bg-status-success/10 p-3 rounded-md">
          <span className="font-medium">Code '{appliedPromo}' applied!</span>
          <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
        </div>
      )}

      {error && <div className="p-4 bg-status-error/10 text-status-error rounded-md">{error}</div>}
      
      {!clientSecret ? (
        <div className="p-4 text-center text-muted-foreground animate-pulse">Initializing secure checkout...</div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm orderGroupId={orderGroupId!} amount={finalAmount} />
        </Elements>
      )}
    </div>
  )
}
