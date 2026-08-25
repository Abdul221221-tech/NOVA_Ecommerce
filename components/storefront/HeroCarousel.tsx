'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

type SlideData = {
  id: string
  headline: string
  description: string
  ctaText: string
  href: string
  imageUrl: string
}

export function HeroCarousel({ slides }: { slides: SlideData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused, shouldReduceMotion, slides.length])

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)

  const slideVariants = {
    enter: { opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 },
    center: { opacity: 1, scale: 1, zIndex: 1, transition: { duration: 0.6, ease: "easeOut" as any } },
    exit: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, zIndex: 0, transition: { duration: 0.8, ease: "easeIn" as any } }
  }

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.8, ease: "easeOut" as any } }
  }

  if (!slides || slides.length === 0) return null

  return (
    <div 
      className="relative w-full h-full min-h-[350px] sm:min-h-[450px] md:min-h-[600px] bg-muted overflow-hidden rounded-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].headline}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
          
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-24 sm:pb-12 sm:p-12 lg:p-16">
            <motion.div variants={textVariants} initial="initial" animate="animate" className="max-w-2xl">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight font-heading break-words">
                {slides[currentIndex].headline}
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-lg">
                {slides[currentIndex].description}
              </p>
              <Link 
                href={slides[currentIndex].href}
                className={buttonVariants({ variant: "default", size: "lg", className: "h-10 px-6 sm:h-12 sm:px-8 text-sm sm:text-base rounded-full font-semibold shadow-xl" })}
              >
                {slides[currentIndex].ctaText}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Controls */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2 sm:gap-4">
        <div className="flex gap-2 mr-2 sm:mr-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button 
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
