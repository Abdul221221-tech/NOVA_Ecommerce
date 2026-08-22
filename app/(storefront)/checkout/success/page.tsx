'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'
import { CheckCircle } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { GradientText } from '@/components/ui/GradientText'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderGroupId = searchParams.get('order_group_id')
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return

    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [shouldReduceMotion])

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-lg min-h-[60vh]">
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="size-24 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="size-12" />
        </div>
      </motion.div>

      <h1 className="text-4xl font-heading font-bold mb-4">
        <GradientText>Order Confirmed!</GradientText>
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Thank you for your purchase. Your order #{orderGroupId?.substring(0,8)} is being processed.
      </p>

      <div className="flex gap-4">
          <Link href="/account/orders" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8">
            View Order Status
          </Link>
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8">
            Continue Shopping
          </Link>
      </div>
    </div>
  )
}
