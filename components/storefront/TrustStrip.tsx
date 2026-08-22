'use client'

import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: Truck,
    title: 'Free Shipping',
    subtitle: 'On orders above ₹351',
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-amber-500/10',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Payment',
    subtitle: 'Safe & secure checkout',
    gradient: 'from-emerald-500/10 to-green-500/5',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  {
    icon: RefreshCw,
    title: 'Free Returns & Exchange',
    subtitle: 'Easy returns within 10 days',
    gradient: 'from-blue-500/10 to-sky-500/5',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    glow: 'group-hover:shadow-blue-500/10',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    subtitle: "We're always here to help",
    gradient: 'from-violet-500/10 to-purple-500/5',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    glow: 'group-hover:shadow-violet-500/10',
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
}

export function TrustStrip() {
  return (
    <section className="w-full border-t border-border/40 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {benefits.map(({ icon: Icon, title, subtitle, gradient, iconBg, iconColor, glow }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className={`group relative flex items-start gap-5 p-6 rounded-2xl border border-border/40 bg-gradient-to-br ${gradient} backdrop-blur-sm cursor-default
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:border-border/70 hover:shadow-xl ${glow}`}
            >
              {/* Icon container */}
              <div
                className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} transition-all duration-300`}
              >
                <Icon
                  className={`w-5 h-5 ${iconColor} transition-transform duration-300 group-hover:scale-110`}
                  strokeWidth={2}
                />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-heading text-[15px] font-semibold text-foreground leading-snug">
                  {title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Subtle shine on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
