'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion'
import { 
  Package, CreditCard, Truck, RefreshCw, User, Store, 
  Search, ChevronRight, MessageCircle, Mail, ChevronDown
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AIChatWidget } from '@/components/storefront/AIChatWidget'

const topics = [
  { title: 'Orders', icon: Package, href: '#orders', desc: 'Track, modify, or cancel orders' },
  { title: 'Payments', icon: CreditCard, href: '#payments', desc: 'Payment methods and billing' },
  { title: 'Shipping', icon: Truck, href: '/shipping', desc: 'Delivery times and rates' },
  { title: 'Returns', icon: RefreshCw, href: '#returns', desc: 'Return policies and process' },
  { title: 'Account', icon: User, href: '/account', desc: 'Manage your profile and settings' },
  { title: 'Sellers', icon: Store, href: '/seller', desc: 'Resources for NOVA merchants' },
]

const faqs = [
  {
    category: 'Orders & Shipping',
    q: 'How long does shipping take?',
    a: 'Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery.'
  },
  {
    category: 'Orders & Shipping',
    q: 'How can I track my order?',
    a: 'Once your order ships, you will receive a tracking link via email. You can also view real-time tracking updates in the Orders section of your Account.'
  },
  {
    category: 'Returns',
    q: 'What is your return policy?',
    a: 'We offer a 10-day hassle-free return window for unworn items in original packaging. Some final-sale items may be excluded.'
  },
  {
    category: 'Payments',
    q: 'When will I be charged?',
    a: 'Your chosen payment method will be charged immediately upon order confirmation to secure your items.'
  }
]

export default function HelpCenterPage() {
  const prefersReducedMotion = useReducedMotion()
  const [searchFocused, setSearchFocused] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Subtle parallax for the hero headline
  const heroY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 40])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 0])

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans selection:bg-accent-primary/20">
      
      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-white dark:bg-zinc-950 border-b border-border/40">
        {/* Amber Gradient Wash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-primary/15 via-transparent to-transparent dark:from-accent-primary/10 dark:via-transparent dark:to-transparent pointer-events-none" />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container max-w-[900px] mx-auto px-4 relative z-10 text-center"
        >
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center space-x-2 text-sm font-medium text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors duration-250 ease-out">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            <span className="text-foreground">Help Center</span>
          </nav>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-foreground"
          >
            How can we help?
          </motion.h1>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className={`relative max-w-2xl mx-auto transition-all duration-250 ease-out ${searchFocused ? 'scale-[1.02] shadow-[0_0_40px_-10px_rgba(var(--color-accent-primary-rgb,0,0,0),0.2)]' : 'shadow-sm'}`}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`w-6 h-6 transition-colors duration-250 ease-out ${searchFocused ? 'text-accent-primary' : 'text-muted-foreground'}`} />
            </div>
            <Input 
              type="text" 
              placeholder="Search for answers, articles, or topics..." 
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-lg focus-visible:ring-4 focus-visible:ring-accent-primary/20 focus-visible:border-accent-primary transition-all duration-250 ease-out"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>

          {/* Trending Chips */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            <span className="text-sm font-medium text-muted-foreground mr-2">Trending:</span>
            {['Where\'s my order?', 'Return policy', 'Payment methods'].map((chip) => (
              <button key={chip} className="px-4 py-1.5 text-sm font-medium bg-slate-100 hover:bg-accent-primary/15 dark:bg-zinc-900 dark:hover:bg-accent-primary/20 text-slate-700 hover:text-accent-primary dark:text-zinc-300 dark:hover:text-accent-primary rounded-full transition-colors duration-250 ease-out">
                {chip}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* --- CATEGORY CARDS --- */}
      <section className="py-20 md:py-32 container max-w-[1200px] mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {topics.map((topic, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Link href={topic.href} className="block group h-full">
                <div className="h-full bg-white dark:bg-zinc-900/50 border border-border/50 rounded-[2rem] p-5 md:p-8 transition-all duration-250 ease-out hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-accent-primary/50">
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-6 group-hover:bg-accent-primary transition-colors duration-250 ease-out shadow-sm">
                    <topic.icon className="w-6 h-6 text-accent-primary group-hover:text-white transition-colors duration-250 ease-out" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">{topic.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- FAQ ACCORDION --- */}
      <section className="py-24 bg-white dark:bg-zinc-950 border-y border-border/40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
        <div className="container max-w-[800px] mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.15 } }
              }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-2 flex-wrap"
            >
              {['Frequently', 'Asked', 'Questions'].map((word, i) => (
                <motion.span 
                  key={i} 
                  variants={{ 
                    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 }, 
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } 
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span 
                variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, type: "spring" } } }}
                className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 translate-y-2" 
              />
            </motion.h2>
            <p className="text-lg text-muted-foreground">Quick answers to common questions.</p>
          </div>
          
          <motion.div 
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.06 } }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50"
          >
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div 
                  key={index} 
                  variants={{
                    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                  }} 
                  className="block relative"
                >
                  <div 
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out border ${isOpen ? 'bg-amber-500/5 border-amber-500/30 shadow-md' : 'bg-white dark:bg-zinc-950 border-border/60 hover:bg-amber-500/5 hover:border-amber-500/30 hover:shadow-sm'}`}
                  >
                    {/* Left Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ease-out ${isOpen ? 'bg-amber-500 opacity-100' : 'bg-amber-500 opacity-0 group-hover:opacity-100'}`} />
                    
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex items-center justify-between w-full p-6 text-left focus:outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-lg font-bold pr-8 transition-colors duration-300 ease-out ${isOpen ? 'text-amber-600 dark:text-amber-500' : 'text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-500'}`}>{faq.q}</span>
                      <div 
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${isOpen ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-amber-500/10 text-amber-600/70 group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:text-amber-400/70 dark:group-hover:text-amber-400'}`}
                      >
                        <ChevronDown 
                          className="w-4 h-4 transition-transform duration-300 ease-[0.16,1,0.3,1]" 
                          style={{ transform: isOpen && !prefersReducedMotion ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 0 } : { height: 0 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto' }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { height: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.div 
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
                            className="px-6 pb-6 pt-2 text-muted-foreground leading-relaxed"
                          >
                            {faq.a}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* --- SUPPORT CHANNELS (Still need help?) --- */}
      <section className="py-24 md:py-32 container max-w-[1200px] mx-auto px-4">
        <div className="bg-accent-primary/10 dark:bg-accent-primary/5 border border-accent-primary/20 rounded-[3rem] p-5 md:p-8 md:p-16 text-center max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Still need help?</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            Can't find the answer you're looking for? Our support team is here to assist you across multiple channels.
          </p>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {/* Live Chat */}
            <motion.div variants={itemVariants} className="group bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-5 md:p-8 transition-all duration-250 ease-out hover:shadow-xl hover:shadow-accent-primary/10 hover:-translate-y-1 hover:border-accent-primary/50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="w-12 h-12 rounded-full bg-accent-primary/15 flex items-center justify-center mb-6 shadow-inner group-hover:bg-accent-primary transition-colors duration-250 ease-out"
              >
                <MessageCircle className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors duration-250 ease-out" />
              </motion.div>
              <h3 className="font-bold text-xl mb-2">Live Chat</h3>
              <p className="text-muted-foreground text-sm mb-6">Chat directly with a support agent for instant assistance.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsChatOpen(true)}
                className="w-full rounded-xl h-12 font-bold border border-border bg-transparent text-foreground hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-colors duration-250 ease-out"
              >
                Start Chat
              </motion.button>
            </motion.div>

            {/* Email Support */}
            <motion.div variants={itemVariants} className="group bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-5 md:p-8 transition-all duration-250 ease-out hover:shadow-xl hover:shadow-accent-primary/10 hover:-translate-y-1 hover:border-accent-primary/50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                className="w-12 h-12 rounded-full bg-accent-primary/15 flex items-center justify-center mb-6 shadow-inner group-hover:bg-accent-primary transition-colors duration-250 ease-out"
              >
                <Mail className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors duration-250 ease-out" />
              </motion.div>
              <h3 className="font-bold text-xl mb-2">Email Support</h3>
              <p className="text-muted-foreground text-sm mb-6">Send us a detailed message and we'll reply within 24 hours.</p>
              <Link href="/contact" className="block">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-xl h-12 font-bold border border-border bg-transparent text-foreground hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-colors duration-250 ease-out"
                >
                  Contact Us
                </motion.button>
              </Link>
            </motion.div>

            {/* Seller Support */}
            <motion.div variants={itemVariants} className="group bg-white dark:bg-zinc-900 border border-border/50 rounded-3xl p-5 md:p-8 transition-all duration-250 ease-out hover:shadow-xl hover:shadow-accent-primary/10 hover:-translate-y-1 hover:border-accent-primary/50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                className="w-12 h-12 rounded-full bg-accent-primary/15 flex items-center justify-center mb-6 shadow-inner group-hover:bg-accent-primary transition-colors duration-250 ease-out"
              >
                <Store className="w-5 h-5 text-accent-primary group-hover:text-white transition-colors duration-250 ease-out" />
              </motion.div>
              <h3 className="font-bold text-xl mb-2">Seller Support</h3>
              <p className="text-muted-foreground text-sm mb-6">Dedicated resources and support for NOVA merchants.</p>
              <Link href="/seller" className="block">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-xl h-12 font-bold border border-border bg-transparent text-foreground hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-colors duration-250 ease-out"
                >
                  Seller Help
                </motion.button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- AI Chat Widget --- */}
      <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

    </div>
  )
}
