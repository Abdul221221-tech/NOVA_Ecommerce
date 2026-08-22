'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from 'framer-motion'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[] // e.g. ["from-accent-primary", "via-accent-soft", "to-accent-primary"]
}

export function GradientText({
  children,
  className,
  colors = ["from-accent-primary", "via-accent-soft", "to-accent-primary"]
}: GradientTextProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r",
        ...colors,
        !shouldReduceMotion && "animate-gradient bg-[length:200%_200%]",
        className
      )}
    >
      {children}
    </span>
  )
}
