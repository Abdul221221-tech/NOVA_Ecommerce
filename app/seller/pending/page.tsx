import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function PendingReviewPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-status-warning">Under Review</CardTitle>
          <CardDescription>Your store is currently pending approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our platform administrators are reviewing your store details. You will be able to access the seller dashboard and start adding products once your store is approved.
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
