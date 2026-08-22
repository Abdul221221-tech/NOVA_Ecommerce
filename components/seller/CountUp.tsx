'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export function CountUp({ value, prefix = '', suffix = '', decimals = 0, duration = 1.5 }: CountUpProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  })

  useEffect(() => {
    setHasMounted(true)
    if (prefersReducedMotion) {
      springValue.set(value)
    } else {
      springValue.set(value)
    }
  }, [value, springValue, prefersReducedMotion])

  const display = useTransform(springValue, (current) => {
    return `${prefix}${current.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`
  })

  // Prevent hydration mismatch by rendering static value on server
  if (!hasMounted) {
    return (
      <span>
        {prefix}
        {value.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </span>
    )
  }

  return <motion.span>{display}</motion.span>
}
