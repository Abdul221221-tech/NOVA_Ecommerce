'use client'

import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { Package, ArrowRight, Home, MapPin, Wallet, CalendarDays, Hash } from 'lucide-react'

interface OrderSuccessClientProps {
  id: string
  finalTotal: number
  paymentMethod: string
  estimatedDelivery: string
  deliveryAddress: string
}

export default function OrderSuccessClient({
  id,
  finalTotal,
  paymentMethod,
  estimatedDelivery,
  deliveryAddress
}: OrderSuccessClientProps) {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!shouldReduceMotion) {
      // Fire small brand-colored confetti
      const duration = 2000
      const end = Date.now() + duration

      const colors = ['#22c55e', '#f59e0b', '#10b981'] // Green/Amber brand colors

      ;(function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          disableForReducedMotion: true
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          disableForReducedMotion: true
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }
  }, [shouldReduceMotion])

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.4
      }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const iconVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: "easeInOut"
      } as any
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl min-h-[70vh] flex flex-col items-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex flex-col items-center"
      >
        {/* SUCCESS ICON */}
        <motion.div 
          className="relative mb-8 text-center"
          variants={itemVariants}
        >
          {!shouldReduceMotion && mounted && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, times: [0, 0.5, 1], ease: "easeOut" }}
              className="absolute inset-0 bg-status-success rounded-full blur-2xl z-0"
            />
          )}
          <div className="relative z-10 bg-background border-4 border-status-success/20 rounded-full p-4 shadow-[0_0_40px_rgba(34,197,94,0.15)] inline-block">
            <svg
              className="w-16 h-16 text-status-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.circle 
                cx="12" cy="12" r="10" 
                variants={iconVariants}
              />
              <motion.path 
                d="M8 12l3 3 5-6" 
                variants={iconVariants}
                transition={{ 
                  delay: shouldReduceMotion ? 0 : 0.3, 
                  duration: shouldReduceMotion ? 0 : 0.5,
                  ease: "easeOut" 
                } as any}
              />
            </svg>
          </div>
        </motion.div>
        
        {/* HEADLINE */}
        <motion.h1 
          variants={itemVariants}
          className="font-heading text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground text-center"
        >
          Order Placed Successfully!
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg text-muted-foreground mb-12 max-w-lg text-center"
        >
          Thank you for your purchase. We've received your order and are getting it ready.
        </motion.p>

        {/* ORDER DETAILS CARD */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-2xl bg-surface-base/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-md"
        >
          <h2 className="text-xl font-bold font-heading mb-6 border-b border-border/40 pb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent-primary/10 text-accent-primary">
                  <Hash className="w-4 h-4"/>
                </div>
                Order ID
              </div>
              <div className="font-mono font-bold text-lg">{id.split('-')[0].toUpperCase()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent-primary/10 text-accent-primary">
                  <Wallet className="w-4 h-4"/>
                </div>
                Total Amount
              </div>
              <div className="font-bold font-heading text-xl">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent-primary/10 text-accent-primary">
                  <MapPin className="w-4 h-4"/>
                </div>
                Payment Method
              </div>
              <div className="font-medium">{paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent-primary/10 text-accent-primary">
                  <CalendarDays className="w-4 h-4"/>
                </div>
                Estimated Delivery
              </div>
              <div className="font-medium">{estimatedDelivery}</div>
            </div>
          </div>

          {/* DELIVERY ADDRESS BOX */}
          <div className="mb-8 p-5 bg-accent-primary/5 rounded-xl border border-accent-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary/50"></div>
            <div className="text-sm font-semibold text-accent-primary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4"/> Delivery Address
            </div>
            <div className="font-medium leading-relaxed text-foreground/90">{deliveryAddress}</div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex">
              <Link href="/account/orders" className="relative flex-1 flex items-center justify-center h-14 bg-foreground text-background rounded-xl font-bold transition-all shadow-lg group overflow-hidden">
                {/* Shine sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
                <Package className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">View My Orders</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 flex">
              <Link href="/products" className="flex-1 flex items-center justify-center h-14 bg-transparent border-2 border-border text-foreground rounded-xl font-bold transition-colors hover:border-accent-primary hover:bg-accent-primary/5 hover:text-accent-primary">
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
