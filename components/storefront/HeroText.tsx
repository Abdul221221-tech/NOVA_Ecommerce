'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function HeroText({ text }: { text: string }) {
  const shouldReduceMotion = useReducedMotion()
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as any,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as any,
        damping: 12,
        stiffness: 100,
      },
    },
  }

  if (shouldReduceMotion) {
    return <h1 className="font-heading text-5xl font-bold tracking-tight text-surface-inverse sm:text-6xl">{text}</h1>
  }

  return (
    <motion.h1 
      className="font-heading text-5xl font-bold tracking-tight text-surface-inverse sm:text-6xl flex justify-center flex-wrap gap-x-4"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}
