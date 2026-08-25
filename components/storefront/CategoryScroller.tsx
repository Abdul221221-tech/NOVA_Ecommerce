'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type CategoryWithImage = {
  id: string
  name: string
  slug: string
  imageUrl: string
}

export function CategoryScroller({ categories }: { categories: CategoryWithImage[] }) {
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

  if (!categories || categories.length === 0) return null

  return (
    <div className="relative group">
      
      {/* Desktop Scroll Controls */}
      <button 
        onClick={scrollLeft}
        className="absolute -left-4 top-[calc(50%-2rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={scrollRight}
        className="absolute -right-4 top-[calc(50%-2rem)] z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-background border shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 px-1 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/categories/${cat.slug}`} 
            className="flex flex-col items-center gap-2 sm:gap-4 snap-start shrink-0 group/item w-[28vw] sm:w-32 md:w-40"
          >
            <div className="relative w-[22vw] h-[22vw] sm:w-32 sm:h-32 md:w-40 md:h-40 overflow-hidden rounded-full bg-muted/20 border-2 border-transparent transition-colors group-hover/item:border-accent-primary/20">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>
            <span className="text-[11px] sm:text-sm md:text-base font-semibold text-center leading-tight break-words w-full px-1 transition-colors group-hover/item:text-accent-primary">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      
    </div>
  )
}
