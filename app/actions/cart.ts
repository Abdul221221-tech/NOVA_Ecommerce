'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  
  let cartId: string | null = null
  
  // 1. Resolve Cart Identity
  if (!user) {
    throw new Error("AUTH_REQUIRED")
  }
  
  const { data: existingCart } = await supabase.from('carts').select('id').eq('customer_id', user.id).single()
  if (existingCart) {
    cartId = existingCart.id
  } else {
    const { data: newCart } = await supabase.from('carts').insert({ customer_id: user.id }).select('id').single()
    cartId = newCart?.id
  }

  if (!cartId) throw new Error("Could not resolve cart identity")

  // 1.5. Validate Stock
  const { data: variant } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single()

  if (!variant) throw new Error("Variant not found")
  
  // 2. Add or Update Cart Item
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_variant_id', variantId)
    .single()

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    // Stock validation bypassed per user request
    const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', existingItem.id)
    if (error) throw new Error(error.message)
  } else {
    // Stock validation bypassed per user request
    const { error } = await supabase.from('cart_items').insert({ cart_id: cartId, product_variant_id: variantId, quantity })
    if (error) throw new Error(error.message)
  }
  
  // In a real app we'd toast success or open a slide-out cart. 
  // For now, revalidate the path so any cart count header updates.
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("AUTH_REQUIRED")
  
  if (quantity < 1) {
    return removeCartItem(itemId)
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    
  if (error) throw new Error(error.message)
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("AUTH_REQUIRED")

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}
