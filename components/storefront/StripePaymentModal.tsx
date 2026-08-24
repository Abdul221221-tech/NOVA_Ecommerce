'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function StripeForm({ orderGroupId, amount }: { orderGroupId: string, amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    // Confirm Payment
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success/${orderGroupId}`,
      }
    })

    if (submitError) {
      setError(submitError.message || 'An unexpected error occurred.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-status-error text-sm font-medium">{error}</div>}
      <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full h-12 text-lg font-bold">
        {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : `Pay ₹${amount.toLocaleString('en-IN')}`}
      </Button>
    </form>
  )
}

export function StripePaymentModal({ 
  clientSecret, 
  orderGroupId, 
  amount,
  onCancel
}: { 
  clientSecret: string, 
  orderGroupId: string, 
  amount: number,
  onCancel: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-base border border-border shadow-2xl rounded-2xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          ✕
        </button>
        <h2 className="text-xl font-bold font-heading mb-6">Complete Payment</h2>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <StripeForm orderGroupId={orderGroupId} amount={amount} />
        </Elements>
      </div>
    </div>
  )
}
