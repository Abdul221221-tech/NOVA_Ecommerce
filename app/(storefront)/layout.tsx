import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { StorefrontProvider } from '@/components/storefront/StorefrontProvider'
import { Header } from '@/components/storefront/Header'
import { WorkingSetDock } from '@/components/storefront/WorkingSetDock'
import { TheThread } from '@/components/storefront/TheThread'
import { PageTransition } from '@/components/shared/PageTransition'
import { NewsletterForm } from '@/components/storefront/NewsletterForm'
import { SearchChips } from '@/components/storefront/SearchChips'
import { TrustStrip } from '@/components/storefront/TrustStrip'
import { Footer } from '@/components/storefront/Footer'
import { MobileBottomNav } from '@/components/storefront/MobileBottomNav'
import { fetchNotifications } from '@/app/actions/notifications'

import { NotificationData } from '@/app/actions/notifications'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = 'customer'
  let profile = null
  let notificationsData: { notifications: NotificationData[], unreadCount: number } = { notifications: [], unreadCount: 0 }

  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
    role = profile?.role || user.user_metadata?.role || 'customer'
    notificationsData = await fetchNotifications()
  }

  // Fetch dynamic categories/brands (only those with active products)
  const { data: catProducts } = await supabase.from('products').select('category_id').eq('status', 'active').not('category_id', 'is', null)
  const activeCatIds = new Set(catProducts?.map(p => p.category_id))
  
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const activeCategories = (categories || []).filter(c => activeCatIds.has(c.id))

  const { data: brandProds } = await supabase.from('products').select('brand').eq('status', 'active').not('brand', 'is', null)
  const activeBrands = brandProds ? (Array.from(new Set(brandProds.map(p => p.brand).filter(Boolean))) as string[]).sort() : []

  return (
    <div className="flex min-h-screen flex-col pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
      <StorefrontProvider>
        <Header 
          user={user} 
          profile={profile} 
          role={role} 
          categories={activeCategories} 
          brands={activeBrands}
          initialNotifications={notificationsData.notifications}
          initialUnreadCount={notificationsData.unreadCount}
        />
        <PageTransition>
          <main className="flex-1">{children}</main>
        </PageTransition>
        <TheThread />
        <WorkingSetDock />

        {/* Popular Searches Chip Row */}
        <div className="mt-auto">
          <SearchChips />
        </div>

        <TrustStrip />

        <Footer />
        <MobileBottomNav />
      </StorefrontProvider>
    </div>
  )
}
