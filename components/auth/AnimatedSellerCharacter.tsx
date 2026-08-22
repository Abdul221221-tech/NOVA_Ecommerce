'use client'

import { motion, Variants } from 'framer-motion'

export type SellerCharacterState = 
  | 'idle' 
  | 'emailFocused' 
  | 'passwordFocused' 
  | 'passwordVisible' 
  | 'submitHovered' 
  | 'success' 
  | 'error'

interface AnimatedSellerCharacterProps {
  state: SellerCharacterState
  className?: string
}

export function AnimatedSellerCharacter({ state, className = '' }: AnimatedSellerCharacterProps) {
  // A premium 3D-styled E-commerce Bot
  
  // Floating animation for idle state
  const idleY = [0, -8, 0]
  
  const bodyVariants: Variants = {
    idle: { y: idleY, transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' } },
    emailFocused: { y: 2, rotate: 2, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    passwordFocused: { y: 0, rotate: -2, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    passwordVisible: { y: -2, rotate: 3, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    submitHovered: { y: -5, scale: 1.05, transition: { type: 'spring', stiffness: 300, damping: 15 } },
    success: { y: [0, -15, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
    error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  }

  // Visor screen glows and moves slightly
  const visorVariants: Variants = {
    idle: { x: 0, y: 0 },
    emailFocused: { x: -3, y: 8 },
    passwordFocused: { x: 0, y: -2 },
    passwordVisible: { x: 4, y: 0 },
    submitHovered: { x: 0, y: -3, scale: 1.02 },
    success: { x: 0, y: -4 },
    error: { x: 0, y: 0 }
  }

  // Eyes
  const eyeVariants: Variants = {
    idle: { scaleY: 1, scaleX: 1, borderRadius: "50%" },
    emailFocused: { scaleY: 1, scaleX: 1, borderRadius: "50%" },
    passwordFocused: { scaleY: 0.1, scaleX: 1, borderRadius: "50%" }, // squinting
    passwordVisible: { scaleY: 1.2, scaleX: 1.2, borderRadius: "50%" }, // wide
    submitHovered: { scaleY: 1.3, scaleX: 1.1, borderRadius: "50%" },
    success: { scaleY: 0.3, scaleX: 1.4, borderRadius: "50% 50% 0 0" }, // happy arches
    error: { scaleY: 0.2, scaleX: 1, borderRadius: "10%" } // flat dash
  }

  const rightEyeVariants: Variants = {
    idle: { scaleY: 1, scaleX: 1, borderRadius: "50%" },
    emailFocused: { scaleY: 1, scaleX: 1, borderRadius: "50%" },
    passwordFocused: { scaleY: 0.1, scaleX: 1, borderRadius: "50%" },
    passwordVisible: { scaleY: 0.1, scaleX: 1, borderRadius: "50%" }, // keep closed when peeking
    submitHovered: { scaleY: 1.3, scaleX: 1.1, borderRadius: "50%" },
    success: { scaleY: 0.3, scaleX: 1.4, borderRadius: "50% 50% 0 0" },
    error: { scaleY: 0.2, scaleX: 1, borderRadius: "10%" }
  }

  // Multi-jointed robotic arms covering eyes
  const leftArmVariants: Variants = {
    idle: { x: -60, y: 100, rotate: -60, opacity: 0 },
    emailFocused: { x: -60, y: 100, rotate: -60, opacity: 0 },
    passwordFocused: { x: -10, y: 10, rotate: -20, opacity: 1 },
    passwordVisible: { x: -30, y: 40, rotate: -40, opacity: 1 }, // drop down to peek
    submitHovered: { x: -60, y: 100, rotate: -60, opacity: 0 },
    success: { x: -40, y: -20, rotate: -120, opacity: 1 }, // cheer
    error: { x: -60, y: 100, rotate: -60, opacity: 0 }
  }

  const rightArmVariants: Variants = {
    idle: { x: 60, y: 100, rotate: 60, opacity: 0 },
    emailFocused: { x: 60, y: 100, rotate: 60, opacity: 0 },
    passwordFocused: { x: 10, y: 10, rotate: 20, opacity: 1 },
    passwordVisible: { x: 10, y: 0, rotate: 20, opacity: 1 }, // stay covered
    submitHovered: { x: 60, y: 100, rotate: 60, opacity: 0 },
    success: { x: 40, y: -20, rotate: 120, opacity: 1 }, // cheer
    error: { x: 60, y: 100, rotate: 60, opacity: 0 }
  }

  return (
    <div className={`relative w-64 h-64 flex items-center justify-center ${className}`}>
      <motion.div 
        className="relative w-48 h-48"
        variants={bodyVariants}
        initial="idle"
        animate={state}
      >
        {/* Holographic glowing backplate */}
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-110" />
        
        {/* Main Body Chassis (3D-like rendering) */}
        <div className="absolute inset-2 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[2.5rem] shadow-[inset_0_2px_20px_rgba(255,255,255,0.1),_0_20px_40px_rgba(0,0,0,0.5)] border border-slate-600/50 overflow-hidden">
          
          {/* Top highlight for 3D effect */}
          <div className="absolute top-0 left-1/4 right-1/4 h-2 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
          
          {/* Inner Visor Glass */}
          <motion.div 
            className="absolute left-4 right-4 top-10 bottom-16 bg-gradient-to-b from-slate-900 to-black rounded-3xl border-2 border-slate-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden"
            variants={visorVariants}
            initial="idle"
            animate={state}
          >
            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-white/10" />
            
            {/* Eyes Container */}
            <div className="absolute inset-0 flex items-center justify-center gap-6">
              <motion.div 
                className="w-5 h-8 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                variants={eyeVariants}
              />
              <motion.div 
                className="w-5 h-8 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                variants={rightEyeVariants}
              />
            </div>
            
            {/* Scanning line effect */}
            <div className="absolute left-0 right-0 h-0.5 bg-cyan-500/30 top-1/2 -translate-y-1/2 blur-sm" />
          </motion.div>

          {/* Bottom chassis details */}
          <div className="absolute bottom-6 left-12 right-12 h-2 flex justify-between">
            <div className="w-4 h-full bg-slate-600 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]" />
            <div className="w-4 h-full bg-slate-600 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]" />
            <div className="w-4 h-full bg-slate-600 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Left Arm (Covering eyes) */}
        <motion.div 
          className="absolute z-20 w-16 h-20 origin-bottom-right"
          style={{ top: '20%', left: '-15%' }}
          variants={leftArmVariants}
          initial="idle"
          animate={state}
        >
          {/* 3D Hand */}
          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-3xl border border-slate-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 h-2 bg-cyan-500/30 rounded-full blur-[2px]" />
          </div>
        </motion.div>

        {/* Right Arm */}
        <motion.div 
          className="absolute z-20 w-16 h-20 origin-bottom-left"
          style={{ top: '20%', right: '-15%' }}
          variants={rightArmVariants}
          initial="idle"
          animate={state}
        >
          {/* 3D Hand */}
          <div className="w-full h-full bg-gradient-to-bl from-slate-600 to-slate-800 rounded-3xl border border-slate-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 h-2 bg-cyan-500/30 rounded-full blur-[2px]" />
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
