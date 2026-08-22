'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Tags, 
  Bookmark, 
  Users, 
  ShoppingCart, 
  RefreshCcw, 
  CreditCard, 
  Wallet, 
  LifeBuoy, 
  Megaphone, 
  Bell, 
  BarChart3, 
  Activity, 
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/app/actions/auth'

type NavItem = {
  title: string
  href?: string
  icon: React.ReactNode
  submenu?: { title: string, href: string }[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { 
    title: 'Sellers', 
    icon: <Store className="w-5 h-5" />,
    submenu: [
      { title: 'Pending', href: '/admin/sellers?status=pending' },
      { title: 'Approved', href: '/admin/sellers?status=approved' },
      { title: 'Rejected', href: '/admin/sellers?status=rejected' },
      { title: 'Suspended', href: '/admin/sellers?status=suspended' },
    ]
  },
  { 
    title: 'Products', 
    icon: <Package className="w-5 h-5" />,
    submenu: [
      { title: 'All Products', href: '/admin/products' },
      { title: 'Pending Approval', href: '/admin/products/pending' },
      { title: 'Inventory', href: '/admin/products/inventory' },
    ]
  },
  { title: 'Categories', href: '/admin/categories', icon: <Tags className="w-5 h-5" /> },
  { title: 'Brands', href: '/admin/brands', icon: <Bookmark className="w-5 h-5" /> },
  { title: 'Customers', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { title: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { title: 'Refunds & Exchanges', href: '/admin/refunds', icon: <RefreshCcw className="w-5 h-5" /> },
  { title: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
  { title: 'Payouts', href: '/admin/payouts', icon: <Wallet className="w-5 h-5" /> },
  { title: 'Support', href: '/admin/support', icon: <LifeBuoy className="w-5 h-5" /> },
  { title: 'Marketing', href: '/admin/marketing', icon: <Megaphone className="w-5 h-5" /> },
  { title: 'Notifications', href: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
  { title: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { title: 'Activity Log', href: '/admin/activity', icon: <Activity className="w-5 h-5" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Sellers': true,
    'Products': true
  })

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className="w-64 border-r border-white/5 bg-slate-950 flex flex-col h-screen fixed left-0 top-0 text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-white/5 bg-slate-900/50">
        <span className="font-heading text-xl font-bold tracking-widest text-white">
          NOVA <span className="text-fuchsia-500">ADMIN</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navItems.map((item) => {
          const isActive = item.href === pathname || (item.submenu && item.submenu.some(s => pathname.startsWith(s.href.split('?')[0])))
          
          if (item.submenu) {
            const isOpen = openMenus[item.title]
            return (
              <div key={item.title} className="mb-1">
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5",
                    isActive ? "text-fuchsia-400" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.title}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="mt-1 ml-9 space-y-1 border-l border-white/10 pl-2">
                    {item.submenu.map((sub) => {
                      const isSubActive = pathname === sub.href.split('?')[0]
                      return (
                        <Link
                          key={sub.title}
                          href={sub.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/5",
                            isSubActive ? "text-amber-400 font-medium" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {sub.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.title}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5 mb-1",
                isActive ? "bg-fuchsia-500/10 text-fuchsia-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-900/30">
        <form action={logout}>
          <button 
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Secure Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
