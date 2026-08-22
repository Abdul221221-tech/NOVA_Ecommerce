'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, X } from 'lucide-react'

export function QuickViewModal({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) {
  if (!product) return null

  const primaryImage = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url
  const reviewsCount = product.reviews?.length || 0
  const avgRating = reviewsCount > 0 
    ? product.reviews!.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount 
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-2xl md:max-w-4xl p-0 max-h-[90vh] overflow-hidden bg-card border-none rounded-3xl shadow-2xl flex flex-col gap-0">
        <DialogTitle className="sr-only">Quick View for {product.title}</DialogTitle>
        <DialogDescription className="sr-only">Product quick view modal</DialogDescription>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-background/80 backdrop-blur hover:bg-muted rounded-full transition-colors shadow-sm">
          <X className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden min-h-0">
          {/* Image Gallery Side */}
          <div className="relative w-full shrink-0 aspect-square max-h-[45vh] md:max-h-none md:aspect-auto md:w-1/2 md:h-full bg-slate-50 dark:bg-slate-900">
            {primaryImage ? (
              <Image 
                src={primaryImage} 
                alt={product.title} 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
            )}
          </div>
          
          {/* Details Side */}
          <div className="w-full md:w-1/2 flex flex-col overflow-y-auto min-h-0">
            <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col min-h-full">
            {product.brand && (
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
                {product.brand}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4 leading-tight">
              {product.title}
            </h2>
            
            {/* Rating */}
            {reviewsCount > 0 && (
              <div className="flex items-center gap-1.5 mb-6">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-current' : 'text-slate-300 dark:text-slate-700 stroke-current'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">({reviewsCount} reviews)</span>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-semibold tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through mb-1">
                    ₹{product.compare_at_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full mb-2">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Simple Description snippet if available (or just a placeholder) */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
              This premium product offers excellent quality and timeless design. Experience the perfect blend of functionality and style tailored just for you.
            </p>

            {/* Actions */}
            <div className="mt-auto shrink-0 pt-4">
              <Button onClick={() => window.location.href = `/products/${product.id}`} className="w-full h-14 text-base font-semibold rounded-2xl bg-accent-primary hover:bg-accent-primary/90 text-white shadow-[0_10px_20px_-10px_rgba(var(--accent-primary-rgb),0.5)] transition-all hover:-translate-y-0.5">
                View Full Details
              </Button>
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
