'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPromotion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) throw new Error('Store not found')

  const code = formData.get('code') as string
  const discountType = formData.get('discount_type') as string
  const value = parseFloat(formData.get('value') as string)
  const startsAt = formData.get('starts_at') as string
  const expiresAt = formData.get('expires_at') as string || null

  const { error } = await supabase.from('promotions').insert({
    store_id: store.id,
    code: code.toUpperCase().trim(),
    discount_type: discountType,
    value,
    starts_at: startsAt || new Date().toISOString(),
    expires_at: expiresAt,
    is_active: true
  })

  if (error) {
    console.error(error)
    throw new Error(error.message)
  }

  revalidatePath('/seller/promotions')
  revalidatePath('/')
  return true
}

export async function togglePromotionStatus(promotionId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) throw new Error('Store not found')

  const { error } = await supabase
    .from('promotions')
    .update({ is_active: isActive })
    .eq('id', promotionId)
    .eq('store_id', store.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/seller/promotions')
  revalidatePath('/')
  return true
}

export async function deletePromotion(promotionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
  if (!store) throw new Error('Store not found')

  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', promotionId)
    .eq('store_id', store.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/seller/promotions')
  revalidatePath('/')
  return true
}
