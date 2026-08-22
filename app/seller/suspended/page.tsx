import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function SuspendedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let reason = 'Violations of platform policies.'
  if (user) {
    const { data: store } = await supabase.from('stores').select('suspension_reason').eq('owner_id', user.id).single()
    if (store?.suspension_reason) reason = store.suspension_reason
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-destructive">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-status-error">Store Suspended</CardTitle>
          <CardDescription>Your store account has been suspended.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-md text-sm text-destructive text-left">
            <strong>Reason:</strong> {reason}
          </div>
          <p className="text-sm text-muted-foreground">
            Please contact platform support if you believe this is an error.
          </p>
          <div className="pt-4">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Return to Marketplace
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
