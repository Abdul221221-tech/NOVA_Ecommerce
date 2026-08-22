'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { approveStore, rejectStore, suspendStore, reactivateStore } from '@/app/actions/admin'
import { CheckCircle2, XCircle, ShieldAlert, Loader2, RotateCcw } from 'lucide-react'

export function SellerApprovalControls({ store }: { store: any }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'suspend' | 'reactivate' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    try {
      await approveStore(store.id)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!reason) return alert('Please provide a reason for rejection.')
    setLoading('reject')
    try {
      await rejectStore(store.id, reason)
      setReason('')
    } finally {
      setLoading(null)
    }
  }

  const handleSuspend = async () => {
    if (!reason) return alert('Please provide a reason for suspension.')
    setLoading('suspend')
    try {
      await suspendStore(store.id, reason)
      setReason('')
    } finally {
      setLoading(null)
    }
  }

  const handleReactivate = async () => {
    setLoading('reactivate')
    try {
      await reactivateStore(store.id)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Store Actions</CardTitle>
        <CardDescription className="text-slate-400">Update the seller's operating status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {store.status === 'pending' && (
          <div className="space-y-4">
            <Button 
              onClick={handleApprove}
              disabled={!!loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {loading === 'approve' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Approve Store
            </Button>
            
            <div className="pt-4 border-t border-white/5 space-y-3">
              <Textarea 
                placeholder="Reason for rejection (required)..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-950 border-white/10 text-white resize-none"
              />
              <Button 
                onClick={handleReject}
                disabled={!!loading || !reason}
                variant="destructive"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
              >
                {loading === 'reject' ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                Reject Application
              </Button>
            </div>
          </div>
        )}

        {store.status === 'approved' && (
          <div className="space-y-3">
            <Textarea 
              placeholder="Reason for suspension (required)..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-950 border-white/10 text-white resize-none"
            />
            <Button 
              onClick={handleSuspend}
              disabled={!!loading || !reason}
              className="w-full bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 border border-red-500/20 h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {loading === 'suspend' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
              Suspend Store
            </Button>
          </div>
        )}

        {(store.status === 'suspended' || store.status === 'rejected') && (
          <div className="space-y-3">
            <Button 
              onClick={handleReactivate}
              disabled={!!loading}
              className="w-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 border border-emerald-500/20 h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {loading === 'reactivate' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
              {store.status === 'rejected' ? 'Approve Previously Rejected Store' : 'Reactivate Store'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
