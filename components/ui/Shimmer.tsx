'use client'

import { cn } from "@/lib/utils"
import { useReducedMotion } from 'framer-motion'

export function Shimmer({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div 
      className={cn(
        "rounded-md bg-muted",
        !shouldReduceMotion && "animate-shimmer",
        className
      )} 
    />
  )
}
