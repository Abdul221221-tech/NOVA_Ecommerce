'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { toggleWishlist } from '@/app/actions/wishlist'
import { toast } from 'sonner'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export function WishlistButton({ productId, variant = 'default' }: { productId: string, variant?: 'default' | 'card' | 'outline' }) {
  const { wishlistItems, toggleWishlistLocal } = useStorefront()
  const isWishlisted = wishlistItems.includes(productId)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleToggle = async (e?: React.MouseEvent | null) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    toggleWishlistLocal(productId)
    
    try {
      await toggleWishlist(productId)
      if (!isWishlisted) toast.success('Added to Wishlist')
      else toast.info('Removed from Wishlist')
    } catch (err: any) {
      toggleWishlistLocal(productId) // revert
      if (err.message === "AUTH_REQUIRED") {
        toast.error("Please log in or sign up to continue.")
        router.push(`/signup?redirect=${encodeURIComponent(pathname + '?action=add_to_wishlist&product_id=' + productId)}`)
      } else {
        toast.error('Failed to update wishlist')
      }
    }
  }

  useEffect(() => {
    const action = searchParams.get('action')
    const pid = searchParams.get('product_id')
    
    if (action === 'add_to_wishlist' && pid === productId) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('action')
      newParams.delete('product_id')
      const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
      router.replace(newUrl)
      
      if (!isWishlisted) {
        handleToggle(null)
      }
    }
  }, [searchParams, productId, isWishlisted, pathname, router])

  if (variant === 'card') {
    return (
      <button 
        onClick={handleToggle}
        className="flex items-center justify-center w-[32px] h-[32px] bg-background/90 shadow-sm backdrop-blur-md rounded-full text-muted-foreground hover:text-accent-primary hover:bg-card transition-all hover:scale-110 z-20 focus:outline-none"
      >
        <motion.div
          initial={false}
          animate={{ scale: isWishlisted ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`w-[16px] h-[16px] ${isWishlisted ? 'fill-accent-primary text-accent-primary' : ''}`} strokeWidth={2.5} />
        </motion.div>
      </button>
    )
  }

  return (
    <button 
      className={`w-full h-14 flex items-center justify-center gap-2 group mt-3 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary ${
        variant === 'outline' 
          ? 'border-2 border-border text-foreground bg-transparent hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5' 
          : 'bg-muted/50 text-foreground hover:bg-muted'
      } ${isWishlisted && variant === 'outline' ? 'border-accent-primary text-accent-primary' : ''}`}
      onClick={handleToggle}
    >
      <motion.div
        initial={false}
        animate={{ scale: isWishlisted ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart className={`w-5 h-5 transition-colors group-hover:text-accent-primary ${isWishlisted ? 'fill-accent-primary text-accent-primary' : 'text-muted-foreground'}`} />
      </motion.div>
      {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </button>
  )
}
