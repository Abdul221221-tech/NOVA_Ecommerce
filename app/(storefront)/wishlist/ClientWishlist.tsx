'use client'

import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ProductCard } from '@/components/storefront/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ClientWishlistProps = {
  initialProducts: any[]
}

export function ClientWishlist({ initialProducts }: ClientWishlistProps) {
  const { wishlistItems } = useStorefront()
  
  // Filter the initial products to only show those that are still in the wishlist context
  // This ensures that when a user clicks the heart to remove, it disappears from the list
  const displayedProducts = initialProducts.filter(p => wishlistItems.includes(p.id))

  if (displayedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-7xl flex flex-col items-center justify-center text-center min-h-[50vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground"
        >
          <Heart className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold font-heading mb-3">Your wishlist is waiting for something special.</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Save products you love and find them here anytime. Explore our collections and find your next favorite item.
        </p>
        <Link href="/products" className="bg-foreground text-background hover:bg-foreground/90 transition-colors px-8 py-3 rounded-full font-bold flex items-center justify-center">
          Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {displayedProducts.length} Saved Item{displayedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
