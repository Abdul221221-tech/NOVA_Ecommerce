'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Package, Tag, Heart, Sparkles, Megaphone, Info, Undo2, RefreshCw } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { markAsRead, markAllAsRead, clearNotifications, NotificationData } from '@/app/actions/notifications'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationDropdown({ initialNotifications = [], initialUnreadCount = 0 }: { initialNotifications: NotificationData[], initialUnreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Optimistic UI state
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  useEffect(() => {
    setNotifications(initialNotifications)
    setUnreadCount(initialUnreadCount)
  }, [initialNotifications, initialUnreadCount])

  useEffect(() => {
    let channel: any

    const setupRealtime = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const channelName = `user-notifications-${user.id}-${Math.random().toString(36).substring(2, 9)}`
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'reviews', filter: `customer_id=eq.${user.id}` },
          (payload) => {
            if (payload.new.rating === 1 && payload.new.product_id === 'bccb05e4-d616-479c-89ba-7f43679eb209') {
              let notifPayload = {} as any
              try { notifPayload = JSON.parse(payload.new.body || '{}') } catch (e) {}
              
              const newNotif = {
                id: payload.new.id,
                user_id: payload.new.customer_id,
                created_at: payload.new.created_at,
                ...notifPayload
              } as NotificationData

              setNotifications(prev => [newNotif, ...prev])
              if (!newNotif.is_read) {
                setUnreadCount(prev => prev + 1)
                toast('New Notification', { description: newNotif.title })
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'reviews', filter: `customer_id=eq.${user.id}` },
          (payload) => {
            if (payload.new.rating === 1 && payload.new.product_id === 'bccb05e4-d616-479c-89ba-7f43679eb209') {
              let notifPayload = {} as any
              try { notifPayload = JSON.parse(payload.new.body || '{}') } catch (e) {}
              
              setNotifications(prev => prev.map(n => n.id === payload.new.id ? {
                ...n,
                ...notifPayload
              } : n))
            }
          }
        )
        .subscribe()
    }
    
    setupRealtime()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    startTransition(async () => {
      await markAsRead(id)
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    
    startTransition(async () => {
      await markAllAsRead()
      toast.success('All notifications marked as read')
    })
  }

  const handleClearAll = () => {
    setNotifications([])
    setUnreadCount(0)
    
    startTransition(async () => {
      await clearNotifications()
      toast.success('Notifications cleared')
    })
  }

  const getIconForType = (n: NotificationData) => {
    if (n.icon === 'Package') return <Package className="w-4 h-4 text-blue-500" />
    if (n.icon === 'Undo2') return <Undo2 className="w-4 h-4 text-orange-500" />
    if (n.icon === 'RefreshCw') return <RefreshCw className="w-4 h-4 text-emerald-500" />
    if (n.icon === 'CheckCircle') return <CheckCheck className="w-4 h-4 text-emerald-500" />
    
    switch (n.type) {
      case 'promotion': return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'offer': return <Tag className="w-4 h-4 text-pink-500" />
      case 'order': return <Package className="w-4 h-4 text-blue-500" />
      case 'payment': return <CheckCheck className="w-4 h-4 text-emerald-500" />
      case 'wishlist': return <Heart className="w-4 h-4 text-red-500" />
      case 'new_arrival': return <Megaphone className="w-4 h-4 text-amber-500" />
      case 'system': return <Info className="w-4 h-4 text-blue-400" />
      default: return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  const getLinkForType = (n: NotificationData) => {
    if (n.href) return n.href;
    switch (n.type) {
      case 'order': return `/account/orders/${n.related_id || ''}`
      case 'wishlist': return `/wishlist`
      case 'offer':
      case 'promotion': return `/products?brand=${n.related_id || ''}`
      case 'new_arrival': return `/new-arrivals`
      default: return `/account`
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none">
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white dark:ring-[#0a0514]"
            >
              <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[calc(100vw-1rem)] sm:w-96 p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="h-8 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2">
                <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 w-8 p-0 text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm text-slate-600 dark:text-slate-400">No notifications yet</p>
              <p className="text-xs mt-1">We'll let you know when something arrives!</p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              <AnimatePresence>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                  >
                    <div className="mt-1 shrink-0 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                      {getIconForType(n)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <Link 
                        href={getLinkForType(n)} 
                        onClick={() => {
                          if (!n.is_read) handleMarkAsRead(n.id)
                          setIsOpen(false)
                        }}
                        className="block focus:outline-none"
                      >
                        <p className={`text-sm font-semibold truncate ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </Link>
                    </div>

                    {!n.is_read && (
                      <div className="absolute right-4 top-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(n.id)
                          }}
                          className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full absolute top-2 right-2 group-hover:opacity-0 transition-opacity" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
