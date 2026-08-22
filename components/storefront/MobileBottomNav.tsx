'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, ShoppingCart, User, Store, ShoppingBag } from 'lucide-react'
import { useStorefront } from '@/components/storefront/StorefrontProvider'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { cartItems } = useStorefront()

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/products', icon: ShoppingBag },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: 'Account', href: '/account', icon: User },
  ]

  // Hide on certain routes like checkout or seller dashboard if this component is mounted globally, 
  // but it's only in (storefront) layout, so it won't affect seller.
  // We hide it on /checkout and /products/[id] (Product Details) to allow sticky add-to-cart.
  if (pathname.startsWith('/checkout') || pathname.match(/^\/products\/[^/]+$/)) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-between px-2 h-[60px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-full space-y-1 transition-colors ${
                isActive ? 'text-accent-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'fill-accent-primary/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent-primary text-white text-[9px] sm:text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
