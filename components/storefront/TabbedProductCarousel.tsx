'use client'

import { useState, useMemo } from 'react'
import { ProductCarousel } from '@/components/storefront/ProductCarousel'
import { motion } from 'framer-motion'

type Product = any

export function TabbedProductCarousel({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<string>('All')

  // Extract unique categories from the products array
  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.categories?.name) {
        cats.add(p.categories.name)
      }
    })
    return ['All', ...Array.from(cats).sort()]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') return products
    return products.filter((p) => p.categories?.name === activeTab)
  }, [products, activeTab])

  if (!products || products.length === 0) return null

  return (
    <div className="w-full">
      {/* Tabs Row */}
      <div className="flex overflow-x-auto gap-2 pb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`relative px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
              activeTab === cat ? 'text-background' : 'text-foreground hover:bg-muted'
            }`}
          >
            {activeTab === cat && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-foreground rounded-full -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* Product Carousel for the active tab */}
      {/* We use a key on the component to force a re-render of the scroll position when the tab changes */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProductCarousel products={filteredProducts} />
      </motion.div>
    </div>
  )
}
