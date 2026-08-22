'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPromotion } from '@/app/actions/promotions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

export default function NewPromotionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await createPromotion(new FormData(e.currentTarget))
      router.push('/seller/promotions')
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/seller/promotions" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Promotions
        </Link>
        <h1 className="font-heading text-3xl font-bold">New Promotion</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotion Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input id="code" name="code" required placeholder="e.g. SUMMER20" className="uppercase font-mono" />
              <p className="text-xs text-muted-foreground">Customers will enter this code at checkout.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select name="discount_type" defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" name="value" type="number" step="0.01" min="0" required placeholder="20" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starts_at">Start Date (Optional)</Label>
                <Input id="starts_at" name="starts_at" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input id="expires_at" name="expires_at" type="datetime-local" />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create Promotion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
