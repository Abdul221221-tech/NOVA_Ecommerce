'use client'

import React from 'react'
import { motion, useReducedMotion, Variants } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onClick?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onClick }: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  const iconVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.4 } }
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-surface-base/50"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        variants={iconVariants}
        className="w-16 h-16 bg-accent-primary/10 text-accent-primary rounded-full flex items-center justify-center mb-6 shadow-sm"
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={cn(buttonVariants({ variant: "default" }), "shadow-md")}>
            {actionLabel}
          </Link>
        ) : onClick ? (
          <button onClick={onClick} className={cn(buttonVariants({ variant: "default" }), "shadow-md")}>
            {actionLabel}
          </button>
        ) : null
      )}
    </motion.div>
  )
}
