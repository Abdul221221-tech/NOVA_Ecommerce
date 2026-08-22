'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { login, signup } from '@/app/actions/auth'
import { AnimatedSellerCharacter, SellerCharacterState } from '@/components/auth/AnimatedSellerCharacter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ShoppingBag, Heart, Sparkles, ShoppingCart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'

interface PremiumCustomerAuthFormProps {
  type: 'customer-login' | 'customer-signup'
  error?: string
}

function SubmitButton({ text, onHover, onLeave }: { text: string, onHover: () => void, onLeave: () => void }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-indigo-500/25 h-12 rounded-xl text-base" 
      disabled={pending}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : text}
    </Button>
  )
}

export function PremiumCustomerAuthForm({ type, error }: PremiumCustomerAuthFormProps) {
  const [characterState, setCharacterState] = useState<SellerCharacterState>('idle')
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const isLogin = type === 'customer-login'

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
    'customer-login': {
      title: 'Welcome Back',
      desc: 'Discover products you love and make every purchase feel effortless.',
      action: login,
      currentPath: '/login',
      submitText: 'Sign In',
      footerText: "Don't have an account?",
      footerLink: '/signup',
      footerLinkText: 'Start your journey'
    },
    'customer-signup': {
      title: 'Start Your Journey',
      desc: 'Create your account and discover something you\'ll love.',
      action: signup,
      currentPath: '/signup',
      submitText: 'Create Account',
      footerText: 'Already part of the family?',
      footerLink: '/login',
      footerLinkText: 'Log in'
    }
  }[type]

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#050914] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30">
      
      {/* 1. Immersive Animated Lifestyle Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Deep mesh gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-50 via-white to-pink-50 dark:from-violet-950/40 dark:via-[#050914] dark:to-indigo-950/30" />
        
        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />
        
        {/* Animated glowing blobs */}
        <motion.div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-[120px]"
          animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-fuchsia-400/20 dark:bg-fuchsia-600/10 rounded-full blur-[100px]"
          animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div 
          className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[150px]"
          animate={{ x: [0, 40, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating lifestyle / shopping elements */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20 hidden md:block">
          <motion.div className="absolute top-[20%] left-[12%]" animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-16 h-16 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl">
              <ShoppingBag className="w-8 h-8 text-violet-500 dark:text-violet-400" />
            </div>
          </motion.div>
          <motion.div className="absolute top-[65%] left-[8%]" animate={{ y: [0, 30, 0], rotate: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-12 h-12 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/80 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl">
              <Heart className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </motion.div>
          <motion.div className="absolute top-[25%] right-[15%]" animate={{ y: [0, -25, 0], rotate: [0, 25, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="w-14 h-14 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-white/80 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl">
              <Sparkles className="w-6 h-6 text-pink-500 dark:text-pink-400" />
            </div>
          </motion.div>
          <motion.div className="absolute bottom-[20%] right-[10%]" animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}>
             <div className="w-20 h-20 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl">
              <ShoppingCart className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 gap-4 lg:gap-24">
        
        {/* Left Side: Premium Visual & Anime Mascot */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-8 lg:pt-0">
          
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group focus:outline-none relative overflow-hidden p-2 -ml-2 rounded-2xl">
            <motion.div 
              className="relative w-12 h-12 overflow-hidden rounded-full shadow-[0_0_0_rgba(217,70,239,0)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] border border-white/10 transition-shadow duration-500 z-10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image src="/logo.jpg" alt="NOVA Logo" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
            </motion.div>
            <div className="relative z-10 overflow-hidden pr-2">
              <span 
                className="font-heading text-4xl font-black tracking-tighter inline-block relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-900 dark:from-white dark:to-white group-hover:from-fuchsia-500 group-hover:to-orange-400 group-hover:translate-x-1.5 transition-all duration-500 ease-out"
              >
                NOVA
              </span>
            </div>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight text-slate-900 dark:text-white drop-shadow-sm">
            {isLogin ? (
              <>Step back into <br className="hidden lg:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">your world.</span></>
            ) : (
              <>Uncover things <br className="hidden lg:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">you'll love.</span></>
            )}
          </h1>

          <div className="relative mt-4 lg:mt-12 hidden md:block">
            <div className="absolute inset-0 bg-white/50 dark:bg-white/5 blur-[60px] rounded-full" />
            <AnimatedSellerCharacter 
              state={characterState} 
              className="scale-110 lg:scale-125 origin-center lg:origin-left" 
            />
          </div>
        </div>

        {/* Right Side: Frosted Glass Form */}
        <div className="w-full max-w-md mt-12 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl">
              
              {/* Subtle top light reflection */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50 dark:opacity-10" />
              
              <CardHeader className="text-center space-y-2 pb-8 pt-10 px-8">
                <CardTitle className="font-heading text-3xl font-bold">{config.title}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-base">{config.desc}</CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl mb-6 border border-red-200 dark:border-red-500/20 flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form action={config.action} className="space-y-5">
                  <input type="hidden" name="currentPath" value={config.currentPath} />
                  <input type="hidden" name="redirectTo" value={redirectTo || ''} />
                  {!isLogin && <input type="hidden" name="role" value="customer" />}
                  
                  {!isLogin && (
                    <div className="space-y-2.5">
                      <Label htmlFor="signup-name" className="text-slate-700 dark:text-slate-300 font-medium">Full Name</Label>
                      <Input 
                        id="signup-name" 
                        name="name" 
                        type="text" 
                        required 
                        placeholder="e.g. Jane Doe"
                        className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl transition-all"
                        onFocus={() => setCharacterState('idle')}
                        onBlur={() => setCharacterState('idle')}
                      />
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <Label htmlFor="email-input" className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                    <Input 
                      id="email-input" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="you@example.com" 
                      className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl transition-all"
                      onFocus={() => setCharacterState('emailFocused')}
                      onBlur={() => setCharacterState('idle')}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-input" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                      {isLogin && (
                        <Link href="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium" onFocus={() => setCharacterState('idle')}>
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
                        placeholder="••••••••"
                        onFocus={handlePasswordFocus}
                        onBlur={() => setCharacterState('idle')}
                        className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl pr-12 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="remember-me" 
                        name="rememberMe" 
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600 dark:bg-slate-900 transition-colors cursor-pointer"
                        onFocus={() => setCharacterState('idle')}
                      />
                      <Label htmlFor="remember-me" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                  )}

                  <div className="pt-6">
                    <SubmitButton 
                      text={config.submitText} 
                      onHover={() => setCharacterState('submitHovered')}
                      onLeave={() => setCharacterState('idle')}
                    />
                  </div>
                </form>
              </CardContent>

              <CardFooter className="justify-center border-t border-slate-100 dark:border-white/5 pt-6 pb-8 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md">
                <p className="text-slate-600 dark:text-slate-400">
                  {config.footerText}{' '}
                  <Link href={config.footerLink} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors" onFocus={() => setCharacterState('idle')}>
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
