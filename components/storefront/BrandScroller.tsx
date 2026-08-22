'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function BrandScroller({ brands }: { brands: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (!brands || brands.length === 0) return null

  return (
    <div className="relative group">
      
      {/* Desktop Scroll Controls */}
      <button 
        onClick={scrollLeft}
        className="absolute -left-4 top-[calc(50%-1.25rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={scrollRight}
        className="absolute -right-4 top-[calc(50%-1.25rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-6 pt-2 px-1 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {brands.map((brand) => (
          <Link 
            key={brand} 
            href={`/products?brand=${encodeURIComponent(brand)}`} 
            className="flex items-center justify-center min-w-[200px] h-24 snap-start shrink-0 bg-surface-base border border-border/50 rounded-xl hover:border-accent-primary/40 hover:shadow-md transition-all group/item"
          >
            <span className="font-heading text-lg font-bold text-muted-foreground group-hover/item:text-foreground transition-colors uppercase tracking-widest text-center px-4">
              {brand}
            </span>
          </Link>
        ))}
      </div>
      
    </div>
  )
}
