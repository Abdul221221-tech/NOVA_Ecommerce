'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, ArrowRightLeft, Check, Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { addToCart } from '@/app/actions/cart'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { WishlistButton } from '@/components/storefront/WishlistButton'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { QuickViewModal } from './QuickViewModal'

type ProductCardProps = {
  product: {
    id: string
    title: string
    description?: string | null
    price: number
    compare_at_price?: number | null
    brand?: string | null
    stores?: { name: string; slug: string }
    product_images?: { url: string; sort_order: number }[]
    reviews?: { rating: number }[]
    product_variants?: { id: string; size: string | null; color: string | null; stock_quantity?: number }[]
    categories?: { id: string } | { id: string }[] | null
    created_at?: string
  }
  promoBadge?: string
}

export function ProductCard({ product, promoBadge }: ProductCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToCompare, compareList, refreshCart } = useStorefront()
  
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Derived Data
  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order).map(img => img.url) || []
  const primaryImage = images[0]
  const hasMultipleImages = images.length > 1
  const isCompared = compareList.some((p: any) => p.id === product.id)
  
  const reviewsCount = product.reviews?.length || 0
  const avgRating = reviewsCount > 0 
    ? product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount 
    : 0

  // Stock Logic
  const variants = product.product_variants || []
  let totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
  // Fallback: If no stock is defined in the DB yet, assume it is in stock so we don't show "Out of Stock" everywhere.
  if (variants.length === 0 || totalStock === 0) {
    totalStock = 100
  }
  const isOutOfStock = false // Per user request: Do not mark any product as Out of Stock
  const isLowStock = false

  // Date Logic for "New" badge (e.g. less than 30 days old)
  let isNew = false
  if (product.created_at) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    isNew = new Date(product.created_at) > thirtyDaysAgo
  }

  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    let catId = undefined
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      catId = product.categories[0].id
    } else if (product.categories && !Array.isArray(product.categories)) {
      catId = (product.categories as any).id
    }

    const success = addToCompare({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: primaryImage,
      storeName: product.stores?.name,
      categoryId: catId
    })
    
    if (success) toast.success('Added to comparison')
  }

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (isOutOfStock) return

    const hasOptions = variants.length > 1 || (variants.length === 1 && (variants[0].size !== null || variants[0].color !== null))

    if (hasOptions || variants.length === 0) {
      router.push(`/products/${product.id}`)
      return
    }

    setIsAdding(true)
    try {
      await addToCart(variants[0].id, 1)
      await refreshCart()
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
      toast.success('Added to cart!')
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        toast.error("Please log in or sign up to continue.")
        router.push(`/login?redirect=${encodeURIComponent(pathname + '?action=add_to_cart&variant_id=' + variants[0].id)}`)
      } else {
        toast.error(err.message || 'Failed to add to cart')
      }
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    const action = searchParams.get('action')
    const variantId = searchParams.get('variant_id')
    
    if (action === 'add_to_cart' && variantId && variants.length > 0 && variants[0].id === variantId) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('action')
      newParams.delete('variant_id')
      const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
      router.replace(newUrl)
      
      if (!isAdded) {
        handleAddToCart()
      }
    }
  }, [searchParams, variants, isAdded, pathname, router])

  return (
    <>
      <div
        className="h-full relative outline-none focus-within:ring-2 focus-within:ring-accent-primary rounded-2xl group transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full flex flex-col overflow-hidden border border-border/50 bg-card transition-shadow duration-300 hover:shadow-xl rounded-2xl">
          {/* Image Area */}
          <Link href={`/products/${product.id}`} className="relative aspect-[4/3] w-full bg-muted/50 overflow-hidden block group">
            
            {/* Product Images */}
            {images.length > 0 ? (
              <>
                {/* Mobile Scrollable Images */}
                <div 
                  ref={scrollRef}
                  className="md:hidden flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="flex-none w-full h-full snap-center relative transition-transform duration-500 group-hover:scale-105">
                      <Image 
                        src={img} 
                        alt={`${product.title} - Image ${i + 1}`} 
                        fill 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center" 
                      />
                    </div>
                  ))}
                </div>

                {/* Desktop Static Primary Image */}
                <div className="hidden md:block flex-none w-full h-full relative transition-transform duration-500 group-hover:scale-105">
                  <Image 
                    src={primaryImage} 
                    alt={product.title} 
                    fill 
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center" 
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                No image
              </div>
            )}
            
            {/* Dark Overlay on Hover */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

            {/* Smart Badges (Bottom Left) */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-20 items-start pointer-events-none">
              {isOutOfStock ? (
                <Badge className="bg-slate-900/80 dark:bg-slate-100/80 text-white dark:text-slate-900 backdrop-blur-md border-none font-bold tracking-wide">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge className="bg-orange-500/90 text-white backdrop-blur-md border-none font-bold tracking-wide">Low Stock</Badge>
              ) : null}
              {discountPercent > 0 && !isOutOfStock && (
                <Badge className="bg-emerald-500/90 text-white backdrop-blur-md border-none font-bold tracking-wide">
                  {discountPercent}% OFF
                </Badge>
              )}
              {isNew && !isOutOfStock && !promoBadge && (
                <Badge className="bg-accent-primary/90 text-white backdrop-blur-md border-none font-bold tracking-wide animate-pulse">
                  NEW
                </Badge>
              )}
              {promoBadge && (
                <Badge className="bg-accent-primary/90 text-white backdrop-blur-md border-none font-bold tracking-wide animate-pulse">
                  {promoBadge}
                </Badge>
              )}
            </div>

            {/* Top-Right: Wishlist */}
            {mounted && (
              <div className="absolute top-3 right-3 z-30 opacity-0 -translate-y-2 lg:opacity-0 lg:-translate-y-2 max-lg:opacity-100 max-lg:translate-y-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <WishlistButton variant="card" productId={product.id} />
              </div>
            )}

            {/* Top-Left: Compare */}
            {mounted && (
              <div className="absolute top-3 left-3 z-30 opacity-0 -translate-y-2 lg:opacity-0 lg:-translate-y-2 max-lg:opacity-100 max-lg:translate-y-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button 
                  onClick={handleCompare}
                  aria-label="Compare Product"
                  title={isCompared ? "In Comparison" : "Add to Compare"}
                  className={`flex items-center justify-center w-[32px] h-[32px] rounded-full shadow-sm backdrop-blur-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                    isCompared 
                      ? 'bg-accent-primary text-white scale-105' 
                      : 'bg-background/90 text-muted-foreground hover:bg-white dark:hover:bg-muted-foreground hover:text-foreground hover:scale-110'
                  }`}
                >
                  <ArrowRightLeft className="w-[16px] h-[16px]" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Bottom-Center: Quick View */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hidden md:flex">
               <button
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true) }}
                 className="flex items-center gap-2 bg-background/95 text-foreground px-5 py-2.5 rounded-full font-semibold shadow-lg hover:bg-white dark:hover:bg-muted-foreground hover:scale-105 transition-all"
               >
                 <Eye className="w-4 h-4" />
                 <span>Quick View</span>
               </button>
            </div>
          </Link>
          
          {/* Content Area */}
          <div className="p-4 flex flex-col flex-1">
            <Link href={`/products/${product.id}`} className="flex flex-col flex-1 group/text">
              {product.brand && (
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1.5 opacity-80">
                  {product.brand}
                </span>
              )}
              
              <h3 className="font-heading text-base font-bold text-foreground leading-snug line-clamp-2 min-h-[2.5rem] mb-1.5 group-hover/text:text-accent-primary transition-colors">
                {product.title}
              </h3>
              
              {product.description && (
                <p className="text-[13px] text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed flex-1">
                  {product.description}
                </p>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-auto">
                {reviewsCount > 0 ? (
                  <>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-current' : 'text-slate-200 dark:text-slate-800 stroke-current'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">({reviewsCount})</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground/50">No reviews yet</span>
                )}
              </div>
            </Link>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4" />

            {/* Footer / Add to Cart */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-[19px] font-bold tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through opacity-70 hidden sm:inline-block">
                      ₹{product.compare_at_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Smart Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isAdded || isOutOfStock}
                aria-label="Add to Cart"
                className={`relative overflow-hidden flex items-center justify-center w-10 h-10 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary shadow-sm ${
                  isOutOfStock ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' :
                  isAdded ? 'bg-emerald-500 text-white' :
                  isAdding ? 'bg-accent-primary/80 text-white' :
                  'bg-foreground text-background hover:bg-accent-primary dark:hover:bg-accent-primary hover:text-white hover:scale-105'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : isAdded ? (
                    <motion.div key="added" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                      <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>
      <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  )
}
