import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function StoreProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Store Profile</h2>
        <p className="text-muted-foreground mt-2">Manage how your store appears to customers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>These details are displayed on your store's public page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue="My Premium Store" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store-slug">Store URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">nova.com/store/</span>
              <Input id="store-slug" defaultValue="my-premium-store" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store-desc">Store Description</Label>
            <Textarea id="store-desc" rows={4} defaultValue="We sell the highest quality premium goods for your everyday lifestyle." />
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
