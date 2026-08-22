import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { approveStore, rejectStore, suspendStore } from '@/app/actions/admin'

export default async function PlatformAdminSellersPage() {
  const supabase = await createClient()
  
  // Fetch all stores, joined with owner profiles
  const { data: stores } = await supabase
    .from('stores')
    .select(`
      id, name, description, status, created_at, suspension_reason,
      profiles:owner_id ( email )
    `)
    .order('created_at', { ascending: false })

  const pendingStores = stores?.filter(s => s.status === 'pending') || []
  const allStores = stores || []

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sidebar-primary">Manage Sellers</h1>
        <p className="text-muted-foreground">Approve new applications and moderate existing stores.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Queue ({pendingStores.length})</TabsTrigger>
          <TabsTrigger value="all">All Stores ({allStores.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingStores.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 border rounded-lg text-muted-foreground">
              No pending seller applications.
            </div>
          ) : (
            pendingStores.map(store => (
              <Card key={store.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>Owner: {(store.profiles as any)?.email}</CardDescription>
                    </div>
                    <div className="space-x-2 flex">
                      <form action={approveStore.bind(null, store.id)}>
                        <Button type="submit" variant="default" className="bg-status-success hover:bg-status-success/90">Approve</Button>
                      </form>
                      <form action={rejectStore.bind(null, store.id, 'Application rejected by platform administrator.')}>
                        <Button type="submit" variant="destructive">Reject</Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{store.description}</p>
                  <p className="text-xs text-muted-foreground mt-4">Applied on: {new Date(store.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-4">
          {allStores.map(store => (
            <Card key={store.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {store.name} 
                      <span className={`text-xs px-2 py-1 rounded-full ${store.status === 'approved' ? 'bg-status-success/10 text-status-success' : store.status === 'suspended' ? 'bg-status-error/10 text-status-error' : 'bg-status-warning/10 text-status-warning'}`}>
                        {store.status.toUpperCase()}
                      </span>
                    </CardTitle>
                    <CardDescription>Owner: {(store.profiles as any)?.email}</CardDescription>
                  </div>
                  {store.status === 'approved' && (
                    <form action={suspendStore.bind(null, store.id, 'Suspended by admin review.')}>
                      <Button type="submit" variant="outline" className="text-status-error border-status-error/20 hover:bg-status-error/10">Suspend Store</Button>
                    </form>
                  )}
                  {store.status === 'suspended' && (
                    <form action={approveStore.bind(null, store.id)}>
                      <Button type="submit" variant="outline" className="text-status-success border-status-success/20 hover:bg-status-success/10">Reinstate Store</Button>
                    </form>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
