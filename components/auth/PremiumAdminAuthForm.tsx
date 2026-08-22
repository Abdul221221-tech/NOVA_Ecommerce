'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ShieldAlert, KeyRound, Loader2, Command } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="w-full relative overflow-hidden group bg-gradient-to-r from-fuchsia-600 to-amber-600 hover:from-fuchsia-500 hover:to-amber-500 text-white border-none shadow-lg shadow-fuchsia-500/25 h-12 rounded-xl text-base" 
      disabled={pending}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative flex items-center justify-center gap-2">
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
        {pending ? 'Authenticating...' : text}
      </span>
    </Button>
  )
}

export function PremiumAdminAuthForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full animate-pulse-slow delay-1000" />
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl">
          {/* Top border glowing highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-75" />
          
          <CardHeader className="text-center space-y-4 pb-8 pt-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-fuchsia-500/20 to-amber-500/20 rounded-full flex items-center justify-center border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
            >
              <Command className="w-8 h-8 text-fuchsia-400" />
            </motion.div>
            
            <div className="space-y-2">
              <CardTitle className="font-heading text-3xl font-bold tracking-tight text-white">
                NOVA Admin
              </CardTitle>
              <CardDescription className="text-slate-400 text-base font-medium flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Secure Terminal Access
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 text-red-400 text-sm p-4 rounded-xl mb-6 border border-red-500/20 flex items-start gap-3 backdrop-blur-md"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            )}

            <form action={login} className="space-y-6">
              <input type="hidden" name="currentPath" value="/admin/login" />
              <input type="hidden" name="role" value="platform_admin" />
              
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Admin Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="admin@nova.com" 
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500 h-12 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                  <button type="button" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500 h-12 pr-12 rounded-xl transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <SubmitButton text="Initialize Session" />
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
