'use client'

import { useActionState, useEffect } from 'react'
import { submitContact } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, MapPin, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContact, { error: null, success: false })

  useEffect(() => {
    if (state.success) {
      toast.success("Message sent successfully! We'll get back to you soon.")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes customFadeUp {
          0% { opacity: 0; transform: translateY(50px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatEffect {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); filter: blur(100px); }
          50% { opacity: 0.6; transform: scale(1.2); filter: blur(120px); }
        }
        .anim-fade-up {
          opacity: 0;
          animation: customFadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .anim-delay-100 { animation-delay: 100ms; }
        .anim-delay-200 { animation-delay: 200ms; }
        .anim-delay-300 { animation-delay: 300ms; }
        .anim-delay-400 { animation-delay: 400ms; }
        
        .contact-card {
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.1), 0 0 0 2px var(--color-accent-primary, #000);
        }
        .contact-icon-wrapper {
          transition: all 0.5s ease;
        }
        .contact-card:hover .contact-icon-wrapper {
          transform: scale(1.15) rotate(5deg);
          background-color: var(--color-accent-primary, #000);
          color: #fff;
        }
        
        .premium-input {
          transition: all 0.3s ease;
        }
        .premium-input:focus {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 4px rgba(var(--color-accent-primary-rgb, 0,0,0), 0.15);
        }
        
        .premium-btn {
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .premium-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px -10px var(--color-accent-primary, rgba(0,0,0,0.4));
        }
        .premium-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
      `}} />

      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-100 to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 relative overflow-hidden font-sans">
        
        {/* Subtle Geometric Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Dynamic Background Effects */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-accent-primary/20 rounded-full pointer-events-none"
          style={{ animation: 'glowPulse 10s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full pointer-events-none"
          style={{ animation: 'glowPulse 12s ease-in-out infinite reverse' }}
        />
        
        <div className="container mx-auto px-4 max-w-[1200px] py-20 md:py-32 relative z-10">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28 anim-fade-up">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-black tracking-widest uppercase mb-8 border border-accent-primary/20 backdrop-blur-md">
              Contact Support
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Let's build something <span className="text-accent-primary bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-blue-600">amazing</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our world-class support team is here to assist you. Reach out today and we'll get back to you faster than you can say hello.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            
            {/* Contact Information (Left Column) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="anim-fade-up anim-delay-100 contact-card bg-white dark:bg-zinc-900 border border-border/60 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Mail className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center contact-icon-wrapper shadow-inner" style={{ animation: 'iconFloat 3s ease-in-out infinite' }}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-foreground">Email us</h3>
                    <p className="text-muted-foreground mb-4 font-medium">We'll respond within 24 hours.</p>
                    <a href="mailto:abdulwaheed221221@gmail.com" className="text-accent-primary font-bold text-lg hover:underline underline-offset-4 decoration-2">
                      abdulwaheed221221@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="anim-fade-up anim-delay-200 contact-card bg-white dark:bg-zinc-900 border border-border/60 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MapPin className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center contact-icon-wrapper shadow-inner" style={{ animation: 'iconFloat 3s ease-in-out infinite 1s' }}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-foreground">Visit us</h3>
                    <p className="text-muted-foreground mb-4 font-medium">Stop by our office.</p>
                    <p className="font-bold text-lg text-foreground leading-relaxed">
                      Noida, Sector 05<br/>Dream PG
                    </p>
                  </div>
                </div>
              </div>

              <div className="anim-fade-up anim-delay-300 contact-card bg-white dark:bg-zinc-900 border border-border/60 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Phone className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center contact-icon-wrapper shadow-inner" style={{ animation: 'iconFloat 3s ease-in-out infinite 2s' }}>
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-foreground">Call us</h3>
                    <p className="text-muted-foreground mb-4 font-medium">Available everyday.</p>
                    <a href="tel:+91723485XXXX" className="font-bold text-lg text-foreground hover:text-accent-primary transition-colors">
                      723485XXXX
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Section (Right Column) */}
            <div className="lg:col-span-3 anim-fade-up anim-delay-400">
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-8 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                
                {state.success ? (
                  <div className="text-center py-20 space-y-6" style={{ animation: 'customFadeUp 0.6s forwards' }}>
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-500/10 text-green-500 mb-4 ring-8 ring-green-500/5">
                      <CheckCircle2 className="w-14 h-14" />
                    </div>
                    <h3 className="text-4xl font-extrabold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out. Our team has received your message and will get back to you shortly.
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="mt-10 rounded-2xl px-10 h-14 text-lg font-bold bg-foreground text-background hover:bg-accent-primary hover:text-white transition-all duration-300"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form action={formAction} className="space-y-8">
                    
                    {state.error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3">
                        <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-bold">Submission Failed</h4>
                          <p className="text-sm mt-1">{state.error}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 group">
                        <Label htmlFor="name" className="inline-block text-sm font-black uppercase tracking-[0.2em] text-foreground/70 ml-1 group-focus-within:-translate-y-1 group-focus-within:text-accent-primary transition-all duration-300">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          required 
                          placeholder="Jane Doe" 
                          disabled={isPending}
                          className="premium-input h-16 rounded-2xl bg-slate-100/50 dark:bg-zinc-950/50 border-transparent focus:border-accent-primary text-lg px-6"
                        />
                      </div>
                      <div className="space-y-4 group">
                        <Label htmlFor="email" className="inline-block text-sm font-black uppercase tracking-[0.2em] text-foreground/70 ml-1 group-focus-within:-translate-y-1 group-focus-within:text-accent-primary transition-all duration-300">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          required 
                          placeholder="jane@example.com" 
                          disabled={isPending}
                          className="premium-input h-16 rounded-2xl bg-slate-100/50 dark:bg-zinc-950/50 border-transparent focus:border-accent-primary text-lg px-6"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 group">
                      <Label htmlFor="subject" className="inline-block text-sm font-black uppercase tracking-[0.2em] text-foreground/70 ml-1 group-focus-within:-translate-y-1 group-focus-within:text-accent-primary transition-all duration-300">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        required 
                        placeholder="How can we help you?" 
                        disabled={isPending}
                        className="premium-input h-16 rounded-2xl bg-slate-100/50 dark:bg-zinc-950/50 border-transparent focus:border-accent-primary text-lg px-6"
                      />
                    </div>
                    
                    <div className="space-y-4 group">
                      <Label htmlFor="message" className="inline-block text-sm font-black uppercase tracking-[0.2em] text-foreground/70 ml-1 group-focus-within:-translate-y-1 group-focus-within:text-accent-primary transition-all duration-300">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        required 
                        placeholder="Please provide details about your inquiry..." 
                        rows={6} 
                        disabled={isPending}
                        className="premium-input rounded-3xl bg-slate-100/50 dark:bg-zinc-950/50 border-transparent focus:border-accent-primary text-lg resize-none p-6"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        className="premium-btn w-full h-16 rounded-2xl text-xl font-extrabold bg-foreground text-background hover:bg-accent-primary hover:text-white"
                      >
                        {isPending ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Sending Message...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            Send Message
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  )
}
