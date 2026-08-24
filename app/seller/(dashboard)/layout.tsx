import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/shared/PageTransition'
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ListOrdered,
  ShoppingCart,
  LineChart,
  BarChart3,
  Store,
  Bell,
  User,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

import { SidebarClient } from '@/components/seller/SidebarClient'
import { NotificationDropdown } from '@/components/storefront/NotificationDropdown'
import { fetchNotifications } from '@/app/actions/notifications'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/seller/login')
  }
  
  const { data: store } = await supabase.from('stores').select('name').eq('owner_id', user.id).single()
  
  if (!store) {
    redirect('/seller/create-store')
  }

  const storeName = store.name
  const notificationsData = await fetchNotifications()

  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="w-64 flex-shrink-0 bg-sidebar flex-col hidden md:flex">
        <SidebarClient storeName={storeName} />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-full">
        <header className="h-16 border-b bg-background flex items-center px-4 md:px-8 justify-between flex-shrink-0">
           <div className="flex items-center gap-4">
             <Sheet>
               <SheetTrigger className="md:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative text-muted-foreground">
                 <Menu className="w-5 h-5" />
               </SheetTrigger>
               <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r-0 flex flex-col" aria-describedby={undefined}>
                 <SheetTitle className="sr-only">Seller Navigation</SheetTitle>
                 <SidebarClient storeName={storeName} />
               </SheetContent>
             </Sheet>
             <h1 className="text-lg md:text-xl font-semibold hidden sm:block">Seller Centre</h1>
           </div>
           <div className="flex items-center gap-4">
             {/* Desktop: Render NotificationDropdown inside Client component or directly if we fetch here */}
             <div className="relative text-muted-foreground">
               <NotificationDropdown initialNotifications={notificationsData.notifications} initialUnreadCount={notificationsData.unreadCount} />
             </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <PageTransition>
            <div className="container mx-auto p-4 sm:p-8 max-w-[1200px] w-full">
              {children}
            </div>
          </PageTransition>
        </div>
      </main>
    </div>
  )
}
