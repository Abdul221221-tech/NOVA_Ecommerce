'use client'

import { useStorefront } from './StorefrontProvider'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Layers, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TheThread() {
  const { compareList, removeFromCompare } = useStorefront()
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  
  if (compareList.length === 0) return null

  return (
    <div className="fixed bottom-24 sm:bottom-12 right-4 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          className="pointer-events-auto bg-background/90 backdrop-blur-xl border border-accent-primary/20 p-4 rounded-2xl shadow-2xl w-64"
        >
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <span className="text-sm font-bold uppercase text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-primary" />
              Compare ({compareList.length}/4)
            </span>
          </div>
          <div className="flex gap-2 mb-4 justify-center">
            {Array.from({ length: 4 }).map((_, i) => {
              const p = compareList[i]
              if (p) {
                return (
                  <button 
                    key={p.id} 
                    className="relative size-12 rounded-lg border border-border bg-surface-base group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-primary shadow-sm" 
                    onClick={() => removeFromCompare(p.id)}
                    aria-label={`Remove ${p.title} from comparison`}
                  >
                     {p.imageUrl ? (
                       <Image src={p.imageUrl} alt={p.title} fill className="object-cover rounded-lg" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                     )}
                     <div className="absolute -top-1 -right-1 bg-destructive text-white size-4 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-md">
                       <X className="w-3 h-3" />
                     </div>
                  </button>
                )
              }
              return (
                <div key={`empty-${i}`} className="size-12 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center relative overflow-hidden group">
                  <div className="text-muted-foreground/30 text-xl font-light group-hover:scale-110 transition-transform">+</div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-hover:-top-8 transition-all pointer-events-none whitespace-nowrap">
                    Add another to compare
                  </div>
                </div>
              )
            })}
          </div>
          <button 
            onClick={() => router.push('/compare')}
            disabled={compareList.length < 2}
            className="w-full bg-accent-primary text-background text-sm font-bold py-2.5 rounded-xl hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-accent-primary shadow-md flex items-center justify-center gap-2"
          >
            {compareList.length < 2 ? 'Add 1 more to compare' : 'View Comparison'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
