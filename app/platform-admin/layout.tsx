import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

import { NotificationDropdown } from '@/components/storefront/NotificationDropdown'
import { fetchNotifications } from '@/app/actions/notifications'

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const notificationsData = await fetchNotifications()
  
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-sidebar-primary text-sidebar-primary-foreground">
        <div className="flex h-16 items-center border-b border-sidebar-primary-foreground/10 px-6">
          <Link href="/platform-admin" className="font-heading text-xl font-bold tracking-tight">
            NOVA <span className="text-accent-soft">Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-6">
          <Link href="/platform-admin/sellers" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-primary-foreground/10">Manage Sellers</Link>
          <Link href="/platform-admin/categories" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-primary-foreground/10">Categories</Link>
          <Link href="/platform-admin/metrics" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-primary-foreground/10">Platform Metrics</Link>
        </nav>
        <div className="mt-auto p-4 border-t border-sidebar-primary-foreground/10">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/10 hover:text-sidebar-primary-foreground" type="submit">Log out</Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-muted/20 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-6 justify-end">
          <div className="relative text-muted-foreground">
            <NotificationDropdown initialNotifications={notificationsData.notifications} initialUnreadCount={notificationsData.unreadCount} />
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
