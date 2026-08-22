import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createStripeConnectAccount } from '@/app/actions/stripe'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function SellerSettingsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')

  const { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  if (!store) redirect('/seller/pending')

  const isConnected = !!store.stripe_connect_account_id
  const recentlyConnected = searchParams?.stripe_onboarding_success === 'true'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store details and payout connections.</p>
      </div>

      {recentlyConnected && (
        <div className="bg-status-success/10 text-status-success p-4 rounded-md flex items-center gap-2 border border-status-success/30">
          <CheckCircle2 className="size-5" />
          <p className="font-medium">Stripe account successfully connected!</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connect Payouts</CardTitle>
          <CardDescription>You must connect a Stripe Express account to receive payouts for your orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="bg-status-error/10 p-4 rounded-md flex gap-3 border border-status-error/30">
              <AlertCircle className="size-5 text-status-error shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-status-error">Payouts Disabled</h4>
                <p className="text-sm text-status-error/90">Your products are listable, but customers <strong>cannot</strong> check out with your items until you connect your payout account.</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md flex gap-3 border">
              <CheckCircle2 className="size-5 text-status-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Stripe Connected</h4>
                <p className="text-sm text-muted-foreground">Account ID: {store.stripe_connect_account_id}</p>
                <p className="text-sm text-muted-foreground">You are ready to receive orders!</p>
              </div>
            </div>
          )}

          <form action={createStripeConnectAccount}>
            <Button type="submit" variant={isConnected ? 'outline' : 'default'}>
              {isConnected ? 'Manage Stripe Account' : 'Connect Stripe Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
