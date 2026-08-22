'use client'

import { useEffect } from 'react'
import { useStorefront } from './StorefrontProvider'

export default function ViewTracker({ product }: { product: any }) {
  const { trackView } = useStorefront()

  useEffect(() => {
    trackView({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.product_images?.[0]?.url,
      storeName: product.stores?.name
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]) // Only run when product ID changes

  return null
}
