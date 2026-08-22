'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartDropdown({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cartItems } = useStorefront()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Calculate total
  const subtotal = cartItems?.reduce((total, item) => {
    const price = item.product_variants?.price_override ?? item.product_variants?.products?.price ?? 0
    return total + (price * item.quantity)
  }, 0) || 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-background border shadow-2xl rounded-xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent-primary" />
              Your Cart <span className="text-muted-foreground text-sm font-normal">({cartItems?.length || 0})</span>
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!cartItems || cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">Your cart is empty.</p>
                <Button variant="outline" onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              cartItems.map((item) => {
                const variant = item.product_variants
                const product = variant?.products
                const image = product?.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.url
                const price = variant?.price_override ?? product?.price ?? 0
                
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-muted/20 rounded-md overflow-hidden shrink-0 border">
                      {image ? (
                        <Image src={image} alt={product?.title || 'Product'} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-between py-0.5 overflow-hidden">
                      <div>
                        {product?.brand && <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{product.brand}</p>}
                        <p className="font-medium text-sm line-clamp-1 hover:text-accent-primary transition-colors">
                          <Link href={`/products/${product?.id}`} onClick={onClose}>{product?.title}</Link>
                        </p>
                        {(variant?.size || variant?.color) && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {[variant.color, variant.size].filter(Boolean).join(' / ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-sm">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {cartItems && cartItems.length > 0 && (
            <div className="p-4 border-t bg-muted/10 space-y-4">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
                <div className="flex flex-col gap-2">
                <Link href="/checkout" onClick={onClose} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full bg-accent-primary hover:bg-accent-primary/90 text-white shadow-md h-10 px-4 py-2">
                  Continue to Checkout
                </Link>
                <Link href="/cart" onClick={onClose} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input w-full border-border/50 bg-background hover:bg-muted hover:text-accent-foreground h-10 px-4 py-2">
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
