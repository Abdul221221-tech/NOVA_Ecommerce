'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsSubmitted(true)
      }
    })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#050914] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-50 via-white to-pink-50 dark:from-violet-950/40 dark:via-[#050914] dark:to-indigo-950/30" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-4 focus:outline-none group relative overflow-hidden p-3 rounded-2xl">
              <motion.div 
                className="relative w-16 h-16 overflow-hidden rounded-full shadow-[0_0_0_rgba(217,70,239,0)] group-hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] border border-white/10 transition-shadow duration-500 z-10"
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
          </div>

          <Card className="border-0 shadow-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl ring-1 ring-slate-200/50 dark:ring-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-3 pb-6 pt-8 px-8 text-center relative">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {isSubmitted ? 'Check your email' : 'Forgot Password?'}
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                {isSubmitted 
                  ? 'We have sent a password reset link to your email address.' 
                  : 'Enter your email address and we will send you a link to reset your password.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              
              {!isSubmitted ? (
                <form action={handleSubmit} className="space-y-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="you@example.com" 
                      className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl transition-all"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-indigo-500/25 h-12 rounded-xl text-base" 
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="w-full h-12 rounded-xl text-base border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Try another email
                </Button>
              )}
            </CardContent>
            
            <CardFooter className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Link href="/login" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
