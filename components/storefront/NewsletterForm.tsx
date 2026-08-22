'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { subscribeToNewsletter, unsubscribeFromNewsletter, getNewsletterStatus } from '@/app/actions/newsletter'
import { toast } from 'sonner'
import { ArrowRight, Loader2, Check, X } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{isLoggedIn: boolean, isSubscribed: boolean, email: string | null} | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    getNewsletterStatus().then(res => {
      setStatus(res)
      setIsChecking(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await subscribeToNewsletter(null, formData)
    
    if (result.success) {
      toast.success('Successfully subscribed to the newsletter!')
      setEmail('')
      if (status?.isLoggedIn) {
        setStatus(prev => prev ? { ...prev, isSubscribed: true } : null)
      }
    } else {
      toast.error(result.error)
    }
    
    setIsLoading(false)
  }

  const handleLoggedInAction = async () => {
    if (!status?.email) return
    setIsLoading(true)
    
    if (status.isSubscribed) {
      const res = await unsubscribeFromNewsletter(status.email)
      if (res.success) {
        toast.success('Successfully unsubscribed.')
        setStatus(prev => prev ? { ...prev, isSubscribed: false } : null)
      } else {
        toast.error(res.error)
      }
    } else {
      const formData = new FormData()
      formData.append('email', status.email)
      const res = await subscribeToNewsletter(null, formData)
      if (res.success) {
        toast.success('Successfully subscribed to the newsletter!')
        setStatus(prev => prev ? { ...prev, isSubscribed: true } : null)
      } else {
        toast.error(res.error)
      }
    }
    setIsLoading(false)
  }

  if (isChecking) {
    return (
      <div className="flex h-11 items-center justify-center rounded-lg bg-black/10 animate-pulse w-full sm:w-auto px-8" />
    )
  }

  if (status?.isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row">
        <motion.button 
          onClick={handleLoggedInAction}
          disabled={isLoading}
          whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
          className={`flex h-11 items-center justify-center gap-2 rounded-lg px-8 py-2 text-sm font-bold shadow-md transition-all duration-200 ease-out border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto ${
            status.isSubscribed 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status.isSubscribed ? (
            <>
              Subscribed
              <Check className="h-4 w-4" />
            </>
          ) : (
            'Subscribe'
          )}
        </motion.button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" 
          required
          className="flex-1 h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-white/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/80 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out" 
          disabled={isLoading}
        />
        <motion.button 
          type="submit" 
          disabled={isLoading}
          whileHover={!prefersReducedMotion ? { scale: 1.03, filter: 'brightness(1.1)' } : { filter: 'brightness(1.1)' }}
          whileTap={!prefersReducedMotion ? { scale: 0.97 } : {}}
          className="group relative flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2 text-sm font-bold text-slate-950 shadow-md transition-all duration-200 ease-out overflow-hidden shrink-0 border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Subscribe
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </span>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </motion.button>
      </form>
      <div className="mt-3 text-center sm:text-left">
        <a href="/unsubscribe" className="text-xs text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline">
          Want to unsubscribe?
        </a>
      </div>
    </div>
  )
}
