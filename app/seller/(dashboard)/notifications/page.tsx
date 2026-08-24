import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Package, Tag, AlertCircle, XCircle, Undo2, RefreshCw, CreditCard, Ban } from 'lucide-react'
import { fetchNotifications } from '@/app/actions/notifications'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const iconMap: Record<string, any> = {
  Package,
  XCircle,
  Undo2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Ban
}

export default async function SellerNotificationsPage() {
  const { notifications } = await fetchNotifications()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground mt-2">Stay updated on your store's activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>You have {notifications.filter((n: any) => !n.is_read).length} unread notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">No new notifications.</p>
            ) : notifications.map((n: any) => {
              const Icon = iconMap[n.icon] || Bell
              return (
                <Link key={n.id} href={n.href} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:border-accent-primary/50 ${!n.is_read ? 'bg-muted/50' : 'bg-background'}`}>
                  <div className={`p-2 rounded-full shrink-0 ${!n.is_read ? 'bg-accent-primary/10 text-accent-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{n.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 shrink-0"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
