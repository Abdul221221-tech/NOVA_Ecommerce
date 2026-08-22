'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createStripeConnectAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase.from('stores').select('id, stripe_connect_account_id').eq('owner_id', user.id).single()
  if (!store) throw new Error('Store not found')

  let accountId = store.stripe_connect_account_id

  if (!accountId) {
    // Create new Express account
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
    })
    accountId = account.id
    
    // Save to database
    await supabase.from('stores').update({ stripe_connect_account_id: accountId }).eq('id', store.id)
  }

  // Create an Account Link for onboarding
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/seller/settings`,
    return_url: `${origin}/seller/settings?stripe_onboarding_success=true`,
    type: 'account_onboarding',
  })

  redirect(accountLink.url)
}
