'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Package, Tag, Heart, Sparkles, Megaphone, Info } from 'lucide-react'
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

  const getIconForType = (type: string) => {
    switch (type) {
      case 'promotion': return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'offer': return <Tag className="w-4 h-4 text-pink-500" />
      case 'order': return <Package className="w-4 h-4 text-blue-500" />
      case 'wishlist': return <Heart className="w-4 h-4 text-red-500" />
      case 'new_arrival': return <Megaphone className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  const getLinkForType = (n: NotificationData) => {
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
              className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900"
            >
              <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
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
                      {getIconForType(n.type)}
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
