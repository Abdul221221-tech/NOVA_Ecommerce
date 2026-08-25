'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/storefront/ProductCard'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

type Product = any // Reusing the same implicit type passed to ProductCard from page.tsx

export function ProductCarousel({ products, promoBadge }: { products: Product[], promoBadge?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <div className="relative group">
      
      {/* Desktop Scroll Controls */}
      <button 
        onClick={scrollLeft}
        className="absolute -left-5 top-[calc(50%-1.25rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={scrollRight}
        className="absolute -right-5 top-[calc(50%-1.25rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="grid grid-cols-2 sm:flex sm:overflow-x-auto gap-3 sm:gap-6 pb-8 pt-4 px-2 sm:snap-x sm:snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="sm:snap-start shrink-0 w-full sm:w-[280px] md:w-[320px]">
            <SpotlightCard>
              <ProductCard product={product} promoBadge={promoBadge} />
            </SpotlightCard>
          </div>
        ))}
      </div>
      
    </div>
  )
}
