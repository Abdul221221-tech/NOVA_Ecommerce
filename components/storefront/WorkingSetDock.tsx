'use client'

import { useStorefront } from './StorefrontProvider'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, ShoppingBag, Bookmark, ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

function AnimatedNumber({ value, prefix = "" }: { value: number | string, prefix?: string }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <span className="relative inline-flex overflow-hidden">
      {prefix}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: shouldReduceMotion ? 0 : -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function WorkingSetDock() {
  const { cartItems, savedForLater } = useStorefront()
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  // Track previous cart length to trigger bounce
  const [prevCartLength, setPrevCartLength] = useState(cartItems.length)
  const [isBouncing, setIsBouncing] = useState(false)

  useEffect(() => {
    if (cartItems.length > prevCartLength) {
      setIsBouncing(true)
      const t = setTimeout(() => setIsBouncing(false), 300)
      return () => clearTimeout(t)
    }
    setPrevCartLength(cartItems.length)
  }, [cartItems.length, prevCartLength])

  if (pathname === '/cart' || pathname === '/checkout') return null

  if (cartItems.length === 0 && savedForLater.length === 0) {
    return null
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.quantity * (item.product_variants.price_override || item.product_variants.products.price)), 0)
  
  // Group by store
  const storeGroups: Record<string, any[]> = {}
  cartItems.forEach(item => {
    const storeName = item.product_variants.products.stores.name
    if (!storeGroups[storeName]) storeGroups[storeName] = []
    storeGroups[storeName].push(item)
  })

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      <div className="pointer-events-auto bg-background/80 backdrop-blur-xl border border-b-0 rounded-t-2xl shadow-2xl p-4 w-full max-w-4xl transition-all">
        
        {/* Toggle Bar */}
        <button 
          className="w-full flex justify-between items-center cursor-pointer mb-2 min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-md"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="Toggle cart dock"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={isBouncing && !shouldReduceMotion ? { scale: [1, 1.4, 1], y: [0, -10, 0] } : { scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ShoppingCart className="w-5 h-5 text-accent-primary" />
            </motion.div>
            <span className="font-heading font-bold text-lg flex items-center gap-1">
              <AnimatedNumber value={cartItems.length} /> items
            </span>
            <span className="text-muted-foreground hidden sm:inline">in your cart</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="font-heading font-bold text-lg flex items-center">
              <AnimatedNumber value={cartTotal.toFixed(2)} prefix="₹" />
            </span>
            <Link href="/cart" className="bg-accent-primary text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-primary/90 transition-colors pointer-events-auto min-h-[44px] inline-flex items-center hover:scale-105 active:scale-95" onClick={(e) => e.stopPropagation()}>
              Checkout
            </Link>
            <div className="p-2 hover:bg-muted rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </button>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t mt-4 flex gap-8 pb-2 overflow-x-auto snap-x">
                {Object.entries(storeGroups).map(([storeName, items]) => (
                  <div key={storeName} className="min-w-[200px] shrink-0 snap-start">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">From {storeName}</h4>
                    <div className="flex gap-2">
                      {items.map(item => (
                        <div key={item.id} className="relative size-12 rounded-md overflow-hidden border bg-muted/20">
                          {/* We don't fetch images in the global cart fetch for perf, but we could. Just placeholder for now */}
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center leading-tight p-1">
                            {item.product_variants.products.title.substring(0, 15)}...
                          </div>
                          <div className="absolute top-0 right-0 bg-accent-primary text-background text-[10px] w-4 h-4 flex items-center justify-center rounded-bl-sm font-bold">
                            {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {cartItems.length === 0 && (
                  <div className="text-sm text-muted-foreground italic w-full text-center py-4">Your cart is empty.</div>
                )}
              </div>

              {savedForLater.length > 0 && (
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saved for later</h4>
                  </div>
                  {/* Saved for later rail */}
                  <div className="flex gap-2">
                    {savedForLater.map(item => (
                      <div key={item.id} className="size-12 rounded-md border bg-muted/20" />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}
