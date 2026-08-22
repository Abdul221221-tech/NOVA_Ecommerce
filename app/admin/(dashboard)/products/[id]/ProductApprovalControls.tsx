'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { approveProduct, rejectProduct } from '@/app/actions/admin'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function ProductApprovalControls({ product }: { product: any }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    try {
      await approveProduct(product.id)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!reason) return alert('Please provide a reason for rejection.')
    setLoading('reject')
    try {
      await rejectProduct(product.id, reason)
      setReason('')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Product Actions</CardTitle>
        <CardDescription className="text-slate-400">Manage listing visibility on the marketplace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.approval_status === 'pending' && (
          <div className="space-y-4">
            <Button 
              onClick={handleApprove}
              disabled={!!loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {loading === 'approve' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Approve Product
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
                Reject Listing
              </Button>
            </div>
          </div>
        )}

        {product.approval_status === 'approved' && (
          <div className="space-y-3 text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
             <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
             <p className="text-emerald-400 font-medium">Product is approved and visible to customers.</p>
             <div className="pt-4 mt-4 border-t border-emerald-500/20 space-y-3 text-left">
               <Textarea 
                  placeholder="Reason for pulling listing (required)..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white resize-none"
                />
                <Button 
                  onClick={handleReject}
                  disabled={!!loading || !reason}
                  variant="destructive"
                  className="w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Revoke Approval
                </Button>
             </div>
          </div>
        )}

        {product.approval_status === 'rejected' && (
          <div className="space-y-4">
            <Button 
              onClick={handleApprove}
              disabled={!!loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl flex items-center justify-center gap-2"
            >
              {loading === 'approve' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Re-Approve Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
