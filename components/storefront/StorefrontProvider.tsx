'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserWishlistIds } from '@/app/actions/wishlist'
import { toast } from 'sonner'

type ProductLite = {
  id: string
  title: string
  price: number
  imageUrl?: string
  storeName?: string
  categoryId?: string
}

type StorefrontContextType = {
  recentlyViewed: ProductLite[]
  compareList: ProductLite[]
  savedForLater: any[]
  cartItems: any[]
  wishlistItems: string[]
  trackView: (product: ProductLite) => void
  addToCompare: (product: ProductLite) => boolean | void
  removeFromCompare: (productId: string) => void
  refreshCart: () => Promise<void>
  refreshWishlist: () => Promise<void>
  toggleWishlistLocal: (productId: string) => void
  clearUserLocalData: () => void
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined)

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<ProductLite[]>([])
  const [compareList, setCompareList] = useState<ProductLite[]>([])
  const [savedForLater, setSavedForLater] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [wishlistItems, setWishlistItems] = useState<string[]>([])

  // Load local state on mount
  useEffect(() => {
    try {
      const viewed = localStorage.getItem('nova_recently_viewed')
      if (viewed) setRecentlyViewed(JSON.parse(viewed))
      
      const compare = localStorage.getItem('nova_compare')
      if (compare) setCompareList(JSON.parse(compare))
    } catch(e) {}
    
    refreshCart()
    refreshWishlist()
  }, [])

  const refreshCart = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    const { getCart } = await import('@/app/actions/cart')
    try {
      const items = await getCart()
      setCartItems(items || [])
    } catch (e) {
      console.error('Failed to load cart:', e)
    }
  }

  const refreshWishlist = async () => {
    try {
      const ids = await getUserWishlistIds()
      setWishlistItems(ids)
    } catch (e) {
      console.error('Failed to load wishlist:', e)
    }
  }

  const toggleWishlistLocal = (productId: string) => {
    setWishlistItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const trackView = (product: ProductLite) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      const updated = [product, ...filtered].slice(0, 15) // keep last 15
      localStorage.setItem('nova_recently_viewed', JSON.stringify(updated))
      return updated
    })
  }

  const addToCompare = (product: ProductLite) => {
    let success = false
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) {
        toast.error('Product already in compare list')
        return prev
      }
      if (prev.length >= 4) {
        toast.error('You can compare up to 4 products')
        return prev
      }
      if (prev.length > 0 && prev[0].categoryId && product.categoryId && prev[0].categoryId !== product.categoryId) {
        toast.error('You can only compare similar products.')
        return prev
      }
      const updated = [...prev, product]
      localStorage.setItem('nova_compare', JSON.stringify(updated))
      success = true
      return updated
    })
    return success
  }

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => {
      const updated = prev.filter(p => p.id !== productId)
      localStorage.setItem('nova_compare', JSON.stringify(updated))
      return updated
    })
  }

  const clearUserLocalData = () => {
    setRecentlyViewed([])
    setCompareList([])
    setCartItems([])
    setWishlistItems([])
    localStorage.removeItem('nova_recently_viewed')
    localStorage.removeItem('nova_compare')
  }

  return (
    <StorefrontContext.Provider value={{
      recentlyViewed,
      compareList,
      savedForLater,
      cartItems,
      wishlistItems,
      trackView,
      addToCompare,
      removeFromCompare,
      refreshCart,
      refreshWishlist,
      toggleWishlistLocal,
      clearUserLocalData
    }}>
      {children}
    </StorefrontContext.Provider>
  )
}

export function useStorefront() {
  const context = useContext(StorefrontContext)
  if (context === undefined) {
    throw new Error('useStorefront must be used within a StorefrontProvider')
  }
  return context
}
