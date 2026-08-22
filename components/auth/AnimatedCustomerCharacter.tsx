'use client'

import { motion, Variants } from 'framer-motion'

export type CustomerCharacterState = 
  | 'idle' 
  | 'emailFocused' 
  | 'passwordFocused' 
  | 'passwordVisible' 
  | 'submitHovered' 
  | 'success' 
  | 'error'

interface AnimatedCustomerCharacterProps {
  state: CustomerCharacterState
  className?: string
  isSignup?: boolean
}

export function AnimatedCustomerCharacter({ state, className = '', isSignup = false }: AnimatedCustomerCharacterProps) {
  // A stylish anime-inspired modern young male character in a hoodie
  
  // Head movement
  const headVariants: Variants = {
    idle: { rotate: 0, y: [0, -5, 0], transition: { y: { repeat: Infinity, duration: 4, ease: 'easeInOut' } } },
    emailFocused: { rotate: 3, y: 5, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    passwordFocused: { rotate: -3, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    passwordVisible: { rotate: 5, y: -2, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    submitHovered: { rotate: 0, y: -8, scale: 1.05, transition: { type: 'spring', stiffness: 300, damping: 15 } },
    success: { rotate: 0, y: [0, -15, 0], transition: { duration: 0.5, ease: 'easeInOut' } },
    error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  }

  // Eye movement
  const eyeVariants: Variants = {
    idle: { x: 0, y: 0, scaleY: 1, scaleX: 1, borderRadius: "50%" },
    emailFocused: { x: -4, y: 4, scaleY: 1, scaleX: 1, borderRadius: "50%" },
    passwordFocused: { x: 0, y: 0, scaleY: 0.1, scaleX: 1, borderRadius: "50%" }, // closed/squint
    passwordVisible: { x: 5, y: 0, scaleY: 1.1, scaleX: 1.1, borderRadius: "50%" }, // wide peek
    submitHovered: { x: 0, y: -2, scaleY: 1.2, scaleX: 1.1, borderRadius: "50%" },
    success: { x: 0, y: -3, scaleY: 0.3, scaleX: 1.2, borderRadius: "50% 50% 0 0" }, // happy arches
    error: { x: 0, y: 0, scaleY: 0.3, scaleX: 1, borderRadius: "50%" } // worried squint
  }

  const rightEyeVariants: Variants = {
    idle: { x: 0, y: 0, scaleY: 1, scaleX: 1, borderRadius: "50%" },
    emailFocused: { x: -4, y: 4, scaleY: 1, scaleX: 1, borderRadius: "50%" },
    passwordFocused: { x: 0, y: 0, scaleY: 0.1, scaleX: 1, borderRadius: "50%" },
    passwordVisible: { x: 5, y: 0, scaleY: 0.1, scaleX: 1, borderRadius: "50%" }, // keep one eye closed while peeking
    submitHovered: { x: 0, y: -2, scaleY: 1.2, scaleX: 1.1, borderRadius: "50%" },
    success: { x: 0, y: -3, scaleY: 0.3, scaleX: 1.2, borderRadius: "50% 50% 0 0" },
    error: { x: 0, y: 0, scaleY: 0.3, scaleX: 1, borderRadius: "50%" }
  }

  // Mouth expressions
  const mouthVariants: Variants = {
    idle: { scaleX: 1, scaleY: 1, y: 0, borderRadius: "10px", height: "4px", width: "20px" },
    emailFocused: { scaleX: 0.8, scaleY: 1, y: 2, borderRadius: "10px", height: "4px", width: "16px" },
    passwordFocused: { scaleX: 0.5, scaleY: 1, y: -2, borderRadius: "50%", height: "8px", width: "8px" }, // "o" shape
    passwordVisible: { scaleX: 1, scaleY: 1, y: 0, borderRadius: "10px", height: "4px", width: "24px" }, // smirk
    submitHovered: { scaleX: 1.2, scaleY: 1.5, y: -2, borderRadius: "0 0 20px 20px", height: "12px", width: "24px" }, // open smile
    success: { scaleX: 1.5, scaleY: 2, y: -2, borderRadius: "0 0 20px 20px", height: "16px", width: "28px" }, // big open smile
    error: { scaleX: 1.2, scaleY: 1, y: 2, borderRadius: "20px 20px 0 0", height: "8px", width: "24px" } // frown
  }

  // Hands (with hoodie sleeves) coming up to cover eyes
  const leftHandVariants: Variants = {
    idle: { x: -60, y: 120, rotate: -30, opacity: 0 },
    emailFocused: { x: -60, y: 120, rotate: -30, opacity: 0 },
    passwordFocused: { x: -25, y: 10, rotate: -15, opacity: 1, scale: 1.1 },
    passwordVisible: { x: -35, y: 40, rotate: -30, opacity: 1, scale: 1 }, // drops slightly to peek
    submitHovered: { x: -60, y: 120, rotate: -30, opacity: 0 },
    success: { x: -50, y: -10, rotate: -45, opacity: 1 }, // cheering
    error: { x: -40, y: 40, rotate: -20, opacity: 1 } // hands near face worried
  }

  const rightHandVariants: Variants = {
    idle: { x: 60, y: 120, rotate: 30, opacity: 0 },
    emailFocused: { x: 60, y: 120, rotate: 30, opacity: 0 },
    passwordFocused: { x: 25, y: 10, rotate: 15, opacity: 1, scale: 1.1 },
    passwordVisible: { x: 25, y: 10, rotate: 15, opacity: 1, scale: 1.1 }, // stays covered
    submitHovered: { x: 60, y: 120, rotate: 30, opacity: 0 },
    success: { x: 50, y: -10, rotate: 45, opacity: 1 }, // cheering
    error: { x: 40, y: 40, rotate: 20, opacity: 1 } // hands near face worried
  }

  // Sweatdrop for error
  const sweatdropVariants: Variants = {
    idle: { opacity: 0, y: -10 },
    emailFocused: { opacity: 0, y: -10 },
    passwordFocused: { opacity: 0, y: -10 },
    passwordVisible: { opacity: 0, y: -10 },
    submitHovered: { opacity: 0, y: -10 },
    success: { opacity: 0, y: -10 },
    error: { opacity: 1, y: 0, transition: { type: 'spring' } }
  }
  
  // Sparkles for success
  const sparkleVariants: Variants = {
    idle: { opacity: 0, scale: 0, rotate: 0 },
    emailFocused: { opacity: 0, scale: 0, rotate: 0 },
    passwordFocused: { opacity: 0, scale: 0, rotate: 0 },
    passwordVisible: { opacity: 0, scale: 0, rotate: 0 },
    submitHovered: { opacity: 0, scale: 0, rotate: 0 },
    success: { opacity: 1, scale: 1, rotate: 180, transition: { duration: 0.6 } },
    error: { opacity: 0, scale: 0, rotate: 0 }
  }

  return (
    <div className={`relative w-72 h-72 flex items-center justify-center ${className}`}>
      
      {/* Background glow circle for the character */}
      <div className="absolute inset-0 bg-white/20 dark:bg-white/5 blur-3xl rounded-full scale-90" />

      <motion.div 
        className="relative w-48 h-56 z-10"
        variants={headVariants}
        initial="idle"
        animate={state}
      >
        {/* Hoodie / Hair back layer */}
        <div className="absolute -inset-4 bg-slate-900 rounded-[3rem] rounded-b-[2rem] shadow-xl" />
        
        {/* Face Base */}
        <div className="absolute inset-0 bg-[#ffdcb3] dark:bg-[#fcd0a1] rounded-[2.5rem] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)] border-b-4 border-orange-900/10 overflow-hidden">
          
          {/* Hair Front Bangs */}
          <div className="absolute -top-2 left-0 right-0 h-16 bg-slate-900 rounded-b-3xl shadow-sm overflow-hidden">
            <div className="absolute -bottom-6 left-1/4 w-12 h-12 bg-[#ffdcb3] dark:bg-[#fcd0a1] rounded-full blur-[2px]" />
          </div>
          
          {/* Blush */}
          <div className="absolute top-24 left-4 w-6 h-4 bg-pink-500/20 blur-md rounded-full" />
          <div className="absolute top-24 right-4 w-6 h-4 bg-pink-500/20 blur-md rounded-full" />

          {/* Eyes Container */}
          <div className="absolute top-20 left-0 right-0 flex justify-center gap-8 px-8">
            <motion.div 
              className="w-4 h-6 bg-slate-800"
              variants={eyeVariants}
            />
            <motion.div 
              className="w-4 h-6 bg-slate-800"
              variants={rightEyeVariants}
            />
          </div>

          {/* Mouth */}
          <div className="absolute top-32 left-0 right-0 flex justify-center">
            <motion.div 
              className="bg-slate-800"
              variants={mouthVariants}
            />
          </div>

          {/* Anime Sweatdrop (Error state) */}
          <motion.div 
            className="absolute top-12 right-6 w-4 h-6 bg-cyan-400/80 rounded-t-full rounded-b-[50%] blur-[1px] shadow-sm"
            variants={sweatdropVariants}
            style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
          />
        </div>

        {/* Clothing / Hoodie Neck */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-16 bg-indigo-500 rounded-[2rem] shadow-lg border-4 border-indigo-400" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-12 bg-white rounded-[1rem] shadow-inner" />

        {/* Left Hand / Sleeve covering eyes */}
        <motion.div 
          className="absolute z-20 w-16 h-24 origin-bottom"
          style={{ top: '20%', left: '-10%' }}
          variants={leftHandVariants}
          initial="idle"
          animate={state}
        >
          {/* Sleeve */}
          <div className="absolute inset-0 bg-indigo-500 rounded-3xl shadow-xl border-2 border-indigo-400 overflow-hidden">
             {/* Hand peeking out */}
             <div className="absolute top-0 left-2 right-2 h-6 bg-[#ffdcb3] dark:bg-[#fcd0a1] rounded-t-xl" />
          </div>
        </motion.div>

        {/* Right Hand / Sleeve */}
        <motion.div 
          className="absolute z-20 w-16 h-24 origin-bottom"
          style={{ top: '20%', right: '-10%' }}
          variants={rightHandVariants}
          initial="idle"
          animate={state}
        >
          {/* Sleeve */}
          <div className="absolute inset-0 bg-indigo-500 rounded-3xl shadow-xl border-2 border-indigo-400 overflow-hidden">
             {/* Hand peeking out */}
             <div className="absolute top-0 left-2 right-2 h-6 bg-[#ffdcb3] dark:bg-[#fcd0a1] rounded-t-xl" />
          </div>
        </motion.div>

        {/* Success Sparkles */}
        <motion.div className="absolute -top-12 -left-8 text-yellow-400 w-8 h-8" variants={sparkleVariants}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>
        </motion.div>
        <motion.div className="absolute top-4 -right-12 text-yellow-400 w-6 h-6" variants={sparkleVariants} style={{ transitionDelay: '0.1s' }}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>
        </motion.div>

      </motion.div>
    </div>
  )
}
