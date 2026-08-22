import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountNav } from '@/components/storefront/AccountNav'
import { ProfileBackground } from '@/components/storefront/ProfileBackground'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
      <ProfileBackground />
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 relative z-10">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar for Desktop, Stacked list for Mobile */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <AccountNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
    </div>
  )
}
