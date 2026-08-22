'use client'

import Image from 'next/image'
import { useState, useTransition, useEffect } from 'react'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

import { createBrowserClient } from '@supabase/ssr'

export default function UpdatePasswordPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  useEffect(() => {
    // This initializes the browser client, which automatically detects
    // the #access_token fragment in the URL (from the email link),
    // establishes the session, and sets the cookies so the Server Action will work.
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Listen for auth state changes specifically for the password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Password reset successfully! You can now log in.')
        router.push('/login')
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
              <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Please enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              
              <form action={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300 font-medium">New Password</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="••••••••" 
                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl transition-all"
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="••••••••" 
                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 h-12 rounded-xl transition-all"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-indigo-500/25 h-12 rounded-xl text-base mt-2" 
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </Button>
              </form>
              
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
