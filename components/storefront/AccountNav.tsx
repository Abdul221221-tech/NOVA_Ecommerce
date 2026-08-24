'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, Heart, MapPin, Settings, LogOut, RotateCcw } from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { label: 'Profile', href: '/account', icon: User },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Returns & Exchanges', href: '/account/returns', icon: RotateCcw },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Settings', href: '/account/settings', icon: Settings },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      <div className="md:hidden pb-4 mb-4 border-b border-border/50">
        <h2 className="font-heading text-xl font-bold">My Account</h2>
      </div>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-accent-primary text-background shadow-md' 
                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium text-[15px]">{item.label}</span>
          </Link>
        )
      })}
      
      <div className="pt-4 mt-2 border-t border-border/50">
        <form action={logout}>
          <button 
            type="submit" 
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-[15px]">Logout</span>
          </button>
        </form>
      </div>
    </nav>
  )
}
