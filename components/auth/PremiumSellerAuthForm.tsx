'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { login, signup } from '@/app/actions/auth'
import { AnimatedSellerCharacter, SellerCharacterState } from '@/components/auth/AnimatedSellerCharacter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Store, Package, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'

interface PremiumSellerAuthFormProps {
  type: 'seller-login' | 'seller-signup'
  error?: string
}

function SubmitButton({ text, onHover, onLeave }: { text: string, onHover: () => void, onLeave: () => void }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="w-full relative overflow-hidden group bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground border-none" 
      disabled={pending}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      {pending ? 'Authenticating...' : text}
    </Button>
  )
}

export function PremiumSellerAuthForm({ type, error }: PremiumSellerAuthFormProps) {
  const [characterState, setCharacterState] = useState<SellerCharacterState>('idle')
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = type === 'seller-login'

  useEffect(() => {
    if (error) setCharacterState('error')
  }, [error])

  const handlePasswordFocus = () => {
    setCharacterState(showPassword ? 'passwordVisible' : 'passwordFocused')
  }

  const togglePasswordVisibility = () => {
    const newState = !showPassword
    setShowPassword(newState)
    if (document.activeElement?.id === 'password-input') {
      setCharacterState(newState ? 'passwordVisible' : 'passwordFocused')
    }
  }

  const config = {
    'seller-login': {
      title: 'Seller Portal',
      desc: 'Access your powerful e-commerce workspace',
      action: login,
      currentPath: '/seller/login',
      submitText: 'Sign In to Dashboard',
      footerText: 'Ready to scale your business?',
      footerLink: '/seller/signup',
      footerLinkText: 'Apply as a Seller'
    },
    'seller-signup': {
      title: 'Partner with NOVA',
      desc: 'Create your merchant account today',
      action: signup,
      currentPath: '/seller/signup',
      submitText: 'Create Seller Account',
      footerText: 'Already an active seller?',
      footerLink: '/seller/login',
      footerLinkText: 'Sign In'
    }
  }[type]

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0f1c] text-slate-200">
      
      {/* 1. Immersive Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep mesh gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black" />
        
        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

        {/* Animated glowing orbs */}
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div 
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"
          animate={{ x: [0, 60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating commerce elements */}
        <div className="absolute inset-0 opacity-20">
          <motion.div className="absolute top-[15%] left-[10%]" animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
            <Package className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <motion.div className="absolute top-[60%] left-[5%]" animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
            <BarChart3 className="w-16 h-16 text-indigo-400" />
          </motion.div>
          <motion.div className="absolute top-[20%] right-[10%]" animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </motion.div>
          <motion.div className="absolute bottom-[15%] right-[15%]" animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}>
            <ShieldCheck className="w-14 h-14 text-cyan-500" />
          </motion.div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 gap-8 lg:gap-24">
        
        {/* Left Side: Premium Visual & Mascot */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-8 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium tracking-wide backdrop-blur-md">
            <Store className="w-4 h-4" /> Seller Centre
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            Manage your store <br className="hidden lg:block"/> from one powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">workspace.</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            Join thousands of premium brands scaling their business on NOVA's intelligent e-commerce platform.
          </p>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full" />
            <AnimatedSellerCharacter state={characterState} className="scale-110 lg:scale-125 origin-center lg:origin-left" />
          </div>
        </div>

        {/* Right Side: Frosted Glass Form */}
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card className="relative overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl text-slate-200">
              {/* Top border glowing highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              
              <CardHeader className="text-center space-y-2 pb-8 pt-8">
                <CardTitle className="font-heading text-2xl text-white">{config.title}</CardTitle>
                <CardDescription className="text-slate-400">{config.desc}</CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 text-red-400 text-sm p-4 rounded-lg mb-6 border border-red-500/20 flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form action={config.action} className="space-y-5">
                  <input type="hidden" name="currentPath" value={config.currentPath} />
                  <input type="hidden" name="role" value="seller" />
                  
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-slate-300">Business Name</Label>
                      <Input 
                        id="signup-name" 
                        name="name" 
                        type="text" 
                        required 
                        placeholder="Your Store Name"
                        className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500 h-11"
                        onFocus={() => setCharacterState('idle')}
                        onBlur={() => setCharacterState('idle')}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email-input" className="text-slate-300">Business Email</Label>
                    <Input 
                      id="email-input" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="contact@business.com" 
                      className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500 h-11"
                      onFocus={() => setCharacterState('emailFocused')}
                      onBlur={() => setCharacterState('idle')}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-input" className="text-slate-300">Password</Label>
                      {isLogin && (
                        <Link href="/seller/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Input 
                        id="password-input" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        minLength={6}
                        onFocus={handlePasswordFocus}
                        onBlur={() => setCharacterState('idle')}
                        className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-cyan-500 h-11 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="remember-me" 
                        name="rememberMe" 
                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 transition-colors cursor-pointer"
                        onFocus={() => setCharacterState('idle')}
                      />
                      <Label htmlFor="remember-me" className="text-sm font-medium text-slate-300 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                  )}

                  <div className="pt-4">
                    <SubmitButton 
                      text={config.submitText} 
                      onHover={() => setCharacterState('submitHovered')}
                      onLeave={() => setCharacterState('idle')}
                    />
                  </div>
                </form>
              </CardContent>

              <CardFooter className="justify-center border-t border-white/5 pt-6 pb-8 bg-slate-950/30">
                <p className="text-sm text-slate-400">
                  {config.footerText}{' '}
                  <Link href={config.footerLink} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    {config.footerLinkText}
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
