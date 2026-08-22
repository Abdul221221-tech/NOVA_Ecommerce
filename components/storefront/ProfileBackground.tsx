'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function ProfileBackground() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-white to-fuchsia-50 dark:from-amber-950/20 dark:via-[#050914] dark:to-fuchsia-950/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-fuchsia-50/50 dark:from-amber-950/20 dark:via-[#050914] dark:to-fuchsia-950/20" />
      
      {/* Soft grid overlay for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />

      {/* Animated glowing blobs */}
      <motion.div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-400/20 dark:bg-amber-600/15 rounded-full blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-fuchsia-400/20 dark:bg-fuchsia-600/10 rounded-full blur-[100px]"
        animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div 
        className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-orange-200/40 dark:bg-orange-800/10 rounded-full blur-[150px]"
        animate={{ x: [0, 40, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-[120px]"
        animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  )
}
