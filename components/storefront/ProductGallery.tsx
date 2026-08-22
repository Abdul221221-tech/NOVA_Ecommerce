'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Box } from 'lucide-react'
import { ModelViewer } from './ModelViewer'

type ProductImage = {
  url: string
  sort_order: number
}

type ProductGalleryProps = {
  images: ProductImage[]
  title: string
  modelUrl?: string | null
}

export function ProductGallery({ images, title, modelUrl }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const allItems = []
  if (modelUrl) {
    allItems.push({ type: 'model', url: modelUrl })
  }
  images.forEach(img => {
    allItems.push({ type: 'image', url: img.url })
  })

  // Ensure we have at least something to show
  if (allItems.length === 0) {
    return (
      <div className="aspect-square max-h-[500px] bg-muted/20 border rounded-2xl flex items-center justify-center text-muted-foreground">
        No Image Available
      </div>
    )
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % allItems.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + allItems.length) % allItems.length)
  }

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const currentItem = allItems[currentIndex]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: "easeOut" as const }
    })
  }

  return (
    <div className="space-y-4">
      {/* Main Viewport */}
      <div className="relative aspect-square max-h-[500px] bg-white dark:bg-muted/10 border rounded-2xl overflow-hidden group">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            {currentItem.type === 'model' ? (
              <ModelViewer src={currentItem.url} alt={title} />
            ) : (
              <Image
                src={currentItem.url}
                alt={`${title} view ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        {currentItem.type === 'model' && (
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 z-10 shadow-sm border">
            <Box className="w-4 h-4 text-accent-primary animate-pulse" /> 3D / AR Available
          </div>
        )}

        {/* Controls */}
        {allItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-md flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30 disabled:hover:scale-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-md flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30 disabled:hover:scale-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allItems.length > 1 && (
        <div className="flex overflow-x-auto gap-2 sm:grid sm:grid-cols-5 sm:gap-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {allItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`shrink-0 w-20 sm:w-auto snap-center relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                currentIndex === index 
                  ? 'border-accent-primary opacity-100 ring-2 ring-accent-primary/20' 
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-border'
              }`}
            >
              {item.type === 'model' ? (
                <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center text-muted-foreground gap-1">
                  <Box className="w-5 h-5" />
                  <span className="text-[10px] font-medium">3D</span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 20vw, 10vw"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
