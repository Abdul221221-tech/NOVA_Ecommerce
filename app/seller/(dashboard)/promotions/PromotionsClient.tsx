'use client'

import { useState } from 'react'
import Link from 'next/link'
import { togglePromotionStatus, deletePromotion } from '@/app/actions/promotions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PromotionsClient({ promotions }: { promotions: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      await togglePromotionStatus(id, !currentStatus)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return
    setLoading(id)
    try {
      await deletePromotion(id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-md border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                No promotions created yet.
              </TableCell>
            </TableRow>
          ) : (
            promotions.map((promo) => {
              const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
              return (
                <TableRow key={promo.id} className={isExpired ? 'opacity-60' : ''}>
                  <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                  <TableCell>
                    {promo.discount_type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="default" className="bg-status-success">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={promo.is_active} 
                      onCheckedChange={() => handleToggle(promo.id, promo.is_active)}
                      disabled={loading === promo.id || isExpired}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(promo.id)} disabled={loading === promo.id}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
