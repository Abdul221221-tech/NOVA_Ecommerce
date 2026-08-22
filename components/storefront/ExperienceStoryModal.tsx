'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExperienceStoryModalProps {
  story?: string | null
}

export function ExperienceStoryModal({ story }: ExperienceStoryModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use a fallback story if somehow it's null/empty (though AI should have generated one)
  const displayStory = story || "Experience everyday comfort and effortless style with this product. Designed for easy use and long-lasting comfort, it fits naturally into your daily routine while giving you a premium feel."

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="shrink-0 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold shadow-md hover:bg-foreground/90 transition-transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
      >
        <Sparkles className="w-4 h-4" /> Experience Story
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-background rounded-3xl shadow-2xl p-8 z-[101] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-6 mt-4">
                <div className="w-16 h-16 bg-accent-primary/10 text-accent-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold font-heading tracking-tight">The Experience</h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed font-serif">
                  {displayStory}
                </p>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-colors w-full"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
