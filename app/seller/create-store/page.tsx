'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createStore, checkSlugAvailability } from '@/app/actions/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateStorePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    // Auto-generate slug
    const generatedSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setSlug(generatedSlug)
    checkSlug(generatedSlug)
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')
    setSlug(newSlug)
    checkSlug(newSlug)
  }

  const checkSlug = async (s: string) => {
    if (!s) return setSlugStatus('idle')
    setSlugStatus('checking')
    const isAvailable = await checkSlugAvailability(s)
    setSlugStatus(isAvailable ? 'available' : 'taken')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (slugStatus === 'taken' || isSubmitting) return
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      let logoUrl = ''
      if (file) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Math.random()}.${fileExt}`
          const { error: uploadError } = await supabase.storage.from('store-logos').upload(fileName, file)
          if (!uploadError) {
            const { data } = supabase.storage.from('store-logos').getPublicUrl(fileName)
            logoUrl = data.publicUrl
          }
        }
      }
      
      formData.append('logoUrl', logoUrl)
      await createStore(formData)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-accent-primary">Create Your Store</CardTitle>
          <CardDescription>Setup your premium store profile to start selling.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" name="name" required value={name} onChange={handleNameChange} placeholder="My Premium Store" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Store URL (Slug)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-sm">nova.com/store/</span>
                <Input id="slug" name="slug" required value={slug} onChange={handleSlugChange} />
              </div>
              {slugStatus === 'available' && <p className="text-xs text-status-success">URL is available!</p>}
              {slugStatus === 'taken' && <p className="text-xs text-status-error">URL is already taken.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea id="description" name="description" required placeholder="Tell customers about your brand..." className="resize-none" rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Store Logo</Label>
              <Input id="logo" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <Button type="submit" className="w-full bg-accent-primary hover:bg-accent-primary/90" disabled={isSubmitting || slugStatus === 'taken'}>
              {isSubmitting ? 'Creating...' : 'Submit for Approval'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
