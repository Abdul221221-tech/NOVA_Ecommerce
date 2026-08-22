'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/actions/cart'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { ShoppingCart, Check } from 'lucide-react'

// Map common color names to CSS hex codes or standard colors
const COLOR_MAP: Record<string, string> = {
  'navy': '#1E3A8A',
  'black': '#000000',
  'white': '#ffffff',
  'red': '#DC2626',
  'blue': '#3B82F6',
  'green': '#10B981',
  'gray': '#6B7280',
  'grey': '#6B7280',
  'silver': '#E5E7EB',
  'gold': '#F59E0B',
  'brown': '#78350F',
  'yellow': '#FACC15',
  'orange': '#F97316',
  'pink': '#EC4899',
  'purple': '#8B5CF6'
}

type Variant = {
  id: string
  sku: string
  size: string | null
  color: string | null
  price_override: number | null
  stock_quantity: number
}

type VariantSelectorProps = {
  variants: Variant[]
  sizes: string[]
  colors: string[]
  basePrice: number
}

export default function VariantSelector({ variants, sizes, colors, basePrice }: VariantSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { refreshCart } = useStorefront()
  
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length > 0 ? sizes[0] : null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors.length > 0 ? colors[0] : null)
  const [isAdding, setIsAdding] = useState(false)
  const [flyAnimation, setFlyAnimation] = useState<{ x: number, y: number, id: number } | null>(null)

  // Find the variant that matches the current selection
  const matchedVariant = useMemo(() => {
    return variants.find(v => 
      (sizes.length === 0 || v.size === selectedSize) &&
      (colors.length === 0 || v.color === selectedColor)
    )
  }, [variants, sizes, colors, selectedSize, selectedColor])

  const price = matchedVariant?.price_override ?? basePrice
  const isOutOfStock = false // Per user request: Do not mark any product as Out of Stock

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!matchedVariant || isOutOfStock) return
    
    // Setup coordinates for flying animation
    const rect = e.currentTarget.getBoundingClientRect()
    
    setIsAdding(true)
    try {
      await addToCart(matchedVariant.id, 1)
      await refreshCart()
      toast.success("Added to cart!")
      
      // Trigger animation
      setFlyAnimation({ x: rect.left, y: rect.top, id: Date.now() })
      setTimeout(() => setFlyAnimation(null), 1000)
    } catch (err: any) {
      console.error(err)
      if (err.message === "AUTH_REQUIRED") {
        toast.error("Please log in or sign up to continue.")
        router.push(`/login?redirect=${encodeURIComponent(pathname + '?action=add_to_cart&variant_id=' + matchedVariant.id)}`)
      } else {
        toast.error("Failed to add to cart")
      }
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    const action = searchParams.get('action')
    const autoVariantId = searchParams.get('variant_id')
    
    if (action === 'add_to_cart' && autoVariantId) {
      const targetVariant = variants.find(v => v.id === autoVariantId)
      
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('action')
      newParams.delete('variant_id')
      const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
      router.replace(newUrl)
      
      if (targetVariant && targetVariant.stock_quantity > 0) {
        setIsAdding(true)
        addToCart(targetVariant.id, 1).then(async () => {
          await refreshCart()
          toast.success("Added to cart!")
          setFlyAnimation({ x: window.innerWidth / 2, y: window.innerHeight / 2, id: Date.now() })
          setTimeout(() => setFlyAnimation(null), 1000)
        }).catch(err => {
          if (err.message !== "AUTH_REQUIRED") toast.error("Failed to add to cart")
        }).finally(() => setIsAdding(false))
      }
    }
  }, [searchParams, variants, pathname, router])

  return (
    <div className="space-y-6 pt-6 border-t">
      
      {/* Price display if it differs based on variant */}
      {matchedVariant?.price_override && (
        <div className="text-xl font-medium text-accent-primary">
          Selected Variant Price: ${price.toFixed(2)}
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></label>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => {
              const hex = COLOR_MAP[color.toLowerCase()] || color
              const isWhite = color.toLowerCase() === 'white'
              const isSelected = selectedColor === color
              
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="relative group focus:outline-none"
                  aria-label={`Select color ${color}`}
                  title={color}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-accent-primary' : 'ring-1 ring-border hover:ring-foreground/40'}`}>
                    <div 
                      className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: hex }}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 mx-auto mt-2 ${isWhite ? 'text-black' : 'text-white'}`} strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Size: <span className="text-foreground">{selectedSize}</span></label>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => {
              const isSelected = selectedSize === size
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isSelected ? 'bg-foreground text-background shadow-md scale-[1.02]' : 'bg-muted/50 text-foreground hover:bg-muted border border-transparent hover:border-border'}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer for mobile sticky bar */}
      <div className="h-24 md:hidden w-full" />

      <div className="fixed md:static bottom-0 left-0 right-0 z-50 bg-background/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t md:border-none p-4 pb-safe md:p-0 md:pt-6 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none transition-all">
        {matchedVariant?.price_override && (
          <div className="md:hidden flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">₹{price.toLocaleString('en-IN')}</span>
          </div>
        )}
        {isOutOfStock ? (
          <Button disabled size="lg" className="w-full h-14 bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-bold rounded-2xl">
            Out of Stock
          </Button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full h-14 text-lg font-bold flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary ${isAdding ? 'bg-accent-primary/80 text-white scale-[0.98]' : 'bg-foreground text-background hover:bg-accent-primary hover:text-white hover:-translate-y-1 hover:shadow-accent-primary/20 hover:shadow-2xl active:scale-95'}`}
          >
            <AnimatePresence mode="wait">
              {isAdding ? (
                <motion.div key="adding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Added!
                </motion.div>
              ) : (
                <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
        
        {matchedVariant && matchedVariant.stock_quantity > 0 && matchedVariant.stock_quantity <= 5 && (
          <Badge variant="outline" className="mt-4 text-status-warning border-status-warning animate-pulse">
            Only {matchedVariant.stock_quantity} left in stock!
          </Badge>
        )}

        {/* Flying Cart Animation */}
        <AnimatePresence>
          {flyAnimation && (
            <motion.div
              key={flyAnimation.id}
              initial={{ 
                opacity: 1, 
                scale: 1, 
                position: 'fixed', 
                left: flyAnimation.x, 
                top: flyAnimation.y,
                zIndex: 9999 
              }}
              animate={{ 
                opacity: 0, 
                scale: 0.2, 
                left: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
                top: typeof window !== 'undefined' ? window.innerHeight - 50 : 0 
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center text-white shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
