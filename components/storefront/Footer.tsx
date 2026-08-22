'use client'

import Link from 'next/link'
import Image from 'next/image'
import { NewsletterForm } from '@/components/storefront/NewsletterForm'
import { motion, useReducedMotion } from 'framer-motion'

export function Footer() {
  const prefersReducedMotion = useReducedMotion()

  // Column entrance stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <footer className="relative overflow-hidden bg-[#0c0c0e] text-slate-300 py-10 md:py-24 mt-auto border-t border-white/5">
      
      {/* 1. Ambient Background Detail */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Static soft gradient wash */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.03),_transparent_50%)]" />
        
        {/* Drifting ambient glow */}
        {!prefersReducedMotion && (
          <motion.div 
            className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]"
            animate={{ 
              x: [0, 100, 0, -50, 0], 
              y: [0, 50, -50, 0, 0] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-[1400px]">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none relative overflow-hidden p-2 -ml-2 rounded-2xl">
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
                  className="font-heading text-3xl font-black tracking-tighter inline-block relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-500 group-hover:from-fuchsia-500 group-hover:to-orange-400 group-hover:translate-x-1.5 transition-all duration-500 ease-out"
                >
                  NOVA
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The premium marketplace for independent creators and flagship brands. Elevate your everyday with curated selections.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { 
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, 
                  href: 'https://www.instagram.com/nova_ecommerce221?igsh=cmhnZ3p2bWhldXZt' 
                },
                { 
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>, 
                  href: '#' 
                },
                { 
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, 
                  href: '#' 
                },
                { 
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>, 
                  href: 'https://youtube.com/@abdulwaheed-l7v3y?si=Dm9WaG9-duj16ZHj' 
                }
              ].map((social, i) => (
                <Link key={i} href={social.href} target={social.href !== '#' ? "_blank" : undefined} rel={social.href !== '#' ? "noopener noreferrer" : undefined} className="group relative w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-transparent transition-all duration-200 ease-out hover:bg-amber-500 hover:border-amber-500 hover:scale-110 hover:rotate-6">
                  <social.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors duration-200 ease-out" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Shop Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-[0.15em] text-white uppercase">Shop</h4>
              <div className="w-6 h-1 bg-amber-500 rounded-full" />
            </div>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Categories', href: '/categories' },
                { label: 'New Arrivals', href: '/new-arrivals' },
                { label: 'Bestsellers', href: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="group relative inline-flex items-center py-1.5 text-slate-400 hover:text-amber-500 hover:translate-x-1 transition-all duration-200 ease-out">
                    <span>{link.label}</span>
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-amber-500 origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-[0.15em] text-white uppercase">Support</h4>
              <div className="w-6 h-1 bg-amber-500 rounded-full" />
            </div>
            <ul className="space-y-4 text-sm text-slate-400">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Shipping Info', href: '/shipping' },
                { label: 'Returns', href: '/returns' },
                { label: 'Seller Portal', href: '/seller/login' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="group relative inline-flex items-center py-1.5 text-slate-400 hover:text-amber-500 hover:translate-x-1 transition-all duration-200 ease-out">
                    <span>{link.label}</span>
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-amber-500 origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm tracking-[0.15em] text-white uppercase">Newsletter</h4>
              <div className="w-6 h-1 bg-amber-500 rounded-full" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Subscribe to get special offers, free giveaways, and early access to new releases.
            </p>
            <NewsletterForm />
          </motion.div>
        </motion.div>
        
        {/* Divider */}
        <div className="mt-20 mb-8 h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        
        {/* Copyright Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NOVA Marketplace. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200 py-2">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200 py-2">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
