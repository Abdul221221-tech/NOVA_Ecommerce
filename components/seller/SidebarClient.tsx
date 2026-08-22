'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, Package, PlusCircle, ListOrdered,
  ShoppingCart, LineChart, BarChart3, Store, Bell, User, Settings, LogOut,
  XCircle, Undo2, RefreshCw, CreditCard
} from 'lucide-react'

interface SidebarClientProps {
  storeName: string
}

const navItems = [
  { group: 'Overview', items: [
    { href: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { group: 'Products', items: [
    { href: '/seller/products', icon: Package, label: 'All Products', exact: true },
    { href: '/seller/products/new', icon: PlusCircle, label: 'Add Product' },
  ]},
  { group: 'Sales & Orders', items: [
    { href: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/seller/cancellations', icon: XCircle, label: 'Cancellations' },
    { href: '/seller/returns', icon: Undo2, label: 'Returns' },
    { href: '/seller/exchanges', icon: RefreshCw, label: 'Exchanges' },
    { href: '/seller/refunds', icon: CreditCard, label: 'Refunds' },
    { href: '/seller/sales', icon: LineChart, label: 'Sales Overview' },
    { href: '/seller/analytics', icon: BarChart3, label: 'Analytics' },
  ]},
  { group: 'Store Management', items: [
    { href: '/seller/store', icon: Store, label: 'Store Profile' },
    { href: '/seller/notifications', icon: Bell, label: 'Notifications' },
  ]},
  { group: 'Account', items: [
    { href: '/seller/settings', icon: Settings, label: 'Settings' },
  ]},
]

export function SidebarClient({ storeName }: SidebarClientProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight flex items-center">
          NOVA <span className="text-accent-primary ml-1">Seller</span>
        </Link>
      </div>
      
      {/* Store Info */}
      <motion.div 
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-6 pb-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
            <Store className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Store</p>
            <p className="font-semibold text-foreground truncate max-w-[150px] leading-tight">{storeName}</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <nav className="flex flex-col gap-6">
          {navItems.map((group) => (
            <div key={group.group} className="flex flex-col gap-1">
              {group.group !== 'Overview' && (
                <div className="px-3 mb-1 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href) && (pathname === item.href || pathname[item.href.length] === '/')

                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group ${
                      isActive ? 'text-accent-primary font-semibold' : 'text-sidebar-foreground/80 hover:text-foreground'
                    }`}
                  >
                    {isActive && mounted && !prefersReducedMotion && (
                      <motion.div 
                        layoutId="active-seller-nav"
                        className="absolute inset-0 bg-accent-primary/10 rounded-md border border-accent-primary/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {isActive && (mounted === false || prefersReducedMotion) && (
                      <div className="absolute inset-0 bg-accent-primary/10 rounded-md border border-accent-primary/20" />
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center p-1 rounded-md bg-transparent transition-colors">
                      <item.icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-accent-primary' : 'text-sidebar-foreground/60 group-hover:text-accent-primary'
                      }`} />
                    </div>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Logout */}
      <div className="p-4 border-t flex-shrink-0">
        <form action={logout}>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive group transition-all" type="submit">
            <LogOut className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100" />
            Log out
          </Button>
        </form>
      </div>
    </div>
  )
}
