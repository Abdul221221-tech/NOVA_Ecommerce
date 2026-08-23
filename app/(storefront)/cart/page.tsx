import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CartClient from './CartClient'

export const metadata = {
  title: 'Shopping Cart | NOVA'
}

export default async function CartPageWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signup?redirect=/cart')
  }

  return <CartClient />
}
