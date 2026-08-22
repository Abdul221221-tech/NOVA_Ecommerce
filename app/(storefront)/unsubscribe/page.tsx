import { unsubscribeFromNewsletter } from '@/app/actions/newsletter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MailX } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  const email = params.email

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden text-center">
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <MailX className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">Unsubscribe</CardTitle>
          <CardDescription className="text-base mt-2">
            Are you sure you want to stop receiving promotional emails and updates from NOVA?
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          {email ? (
            <form action={async () => {
              'use server'
              await unsubscribeFromNewsletter(email)
              redirect('/?unsubscribed=true')
            }}>
              <p className="text-slate-900 dark:text-white font-medium mb-6">{email}</p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl">
                  <Link href="/" className="w-full h-full flex items-center justify-center">Cancel</Link>
                </Button>
                <Button type="submit" variant="destructive" className="flex-1 rounded-xl">
                  Unsubscribe
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-left space-y-4">
              <form action={async (formData) => {
                'use server'
                const e = formData.get('email') as string
                if (e) {
                  await unsubscribeFromNewsletter(e)
                  redirect('/?unsubscribed=true')
                }
              }} className="space-y-4">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email address" 
                  required
                  className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" 
                />
                <Button type="submit" variant="destructive" className="w-full rounded-xl h-11">
                  Unsubscribe
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
