import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store, Mail, Phone, Calendar, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SellerApprovalControls } from './SellerApprovalControls'

export default async function SellerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select(`
      *,
      profiles:owner_id ( email, name, mobile_number, date_of_birth )
    `)
    .eq('id', id)
    .single()

  if (!store) notFound()

  const profile = store.profiles as any

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/sellers" className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
            {store.name}
            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
              store.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              store.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {store.status}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">Manage seller access and details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Store className="w-5 h-5 text-fuchsia-400" /> Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Slug URL</span>
                  <span className="text-white">nova.com/store/{store.slug}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Created At</span>
                  <span className="text-white">{new Date(store.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1 text-sm">Description</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-white/5">{store.description || 'No description provided.'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Mail className="w-5 h-5 text-amber-400" /> Owner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <span className="text-white">{profile?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Email Address</span>
                  <span className="text-white">{profile?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</span>
                  <span className="text-white">{profile?.mobile_number || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</span>
                  <span className="text-white">{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <SellerApprovalControls store={store} />
          
          {(store.rejection_reason || store.suspension_reason) && (
            <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 text-sm"><ShieldAlert className="w-4 h-4" /> Administrative Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {store.rejection_reason && (
                  <div>
                    <span className="text-red-400/70 block mb-1 text-xs uppercase font-bold tracking-wider">Rejection Reason</span>
                    <p className="text-white bg-red-500/10 p-3 rounded-lg border border-red-500/20">{store.rejection_reason}</p>
                  </div>
                )}
                {store.suspension_reason && (
                  <div>
                    <span className="text-red-400/70 block mb-1 text-xs uppercase font-bold tracking-wider">Suspension Reason</span>
                    <p className="text-white bg-red-500/10 p-3 rounded-lg border border-red-500/20">{store.suspension_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
