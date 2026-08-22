import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'platform_admin') {
    redirect('/admin/login?error=Access+denied')
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200 selection:bg-fuchsia-500/30">
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64">
        <AdminSidebar />
      </div>
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-hidden">
        <header className="md:hidden h-16 border-b border-white/5 bg-slate-950 flex items-center px-4 justify-between flex-shrink-0">
          <span className="font-heading text-xl font-bold tracking-widest text-white">
            NOVA <span className="text-fuchsia-500">ADMIN</span>
          </span>
          <Sheet>
            <SheetTrigger className="p-2 text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r-0 text-slate-200" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
