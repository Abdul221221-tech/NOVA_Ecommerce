'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  
  let cartId: string | null = null
  let sessionId = cookieStore.get('nova_guest_session')?.value
  
  if (!user && !sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set('nova_guest_session', sessionId, { maxAge: 60 * 60 * 24 * 30 }) // 30 days
  }
  
  // 1. Resolve Cart Identity
  if (user) {
    const { data: existingCart } = await supabase.from('carts').select('id').eq('customer_id', user.id).single()
    if (existingCart) {
      cartId = existingCart.id
    } else {
      const { data: newCart } = await supabase.from('carts').insert({ customer_id: user.id }).select('id').single()
      cartId = newCart?.id
    }
  } else {
    // Need admin client to query session carts since RLS restricts it
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: existingCart } = await adminClient.from('carts').select('id').eq('session_id', sessionId!).single()
    if (existingCart) {
      cartId = existingCart.id
    } else {
      const { data: newCart } = await adminClient.from('carts').insert({ session_id: sessionId }).select('id').single()
      cartId = newCart?.id
    }
  }

  if (!cartId) throw new Error("Could not resolve cart identity")

  // 1.5. Validate Stock
  const { data: variant } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single()

  if (!variant) throw new Error("Variant not found")
  
  // 2. Add or Update Cart Item (Admin client for guest carts)
  const clientToUse = user ? supabase : createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data: existingItem } = await clientToUse
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_variant_id', variantId)
    .single()

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > variant.stock_quantity) throw new Error("Not enough stock available")
    const { error } = await clientToUse.from('cart_items').update({ quantity: newQuantity }).eq('id', existingItem.id)
    if (error) throw new Error(error.message)
  } else {
    if (quantity > variant.stock_quantity) throw new Error("Not enough stock available")
    const { error } = await clientToUse.from('cart_items').insert({ cart_id: cartId, product_variant_id: variantId, quantity })
    if (error) throw new Error(error.message)
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientToUse = user ? supabase : createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  if (quantity < 1) {
    return removeCartItem(itemId)
  }

  const { data: item } = await clientToUse.from('cart_items').select('product_variant_id, product_variants(stock_quantity)').eq('id', itemId).single()
  if (item && item.product_variants && quantity > (item.product_variants as any).stock_quantity) {
    throw new Error("Not enough stock available")
  }

  const { error } = await clientToUse
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    
  if (error) throw new Error(error.message)
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientToUse = user ? supabase : createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { error } = await clientToUse
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

export async function mergeGuestCart(userId: string) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('nova_guest_session')?.value
  if (!sessionId) return

  const supabase = await createClient()
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Get guest cart
  const { data: guestCart } = await adminClient.from('carts').select('id').eq('session_id', sessionId).single()
  if (!guestCart) return

  // Get user cart
  const { data: userCart } = await supabase.from('carts').select('id').eq('customer_id', userId).single()
  let targetCartId = userCart?.id

  if (!targetCartId) {
    // If user has no cart, just assign the guest cart to the user
    await adminClient.from('carts').update({ customer_id: userId, session_id: null }).eq('id', guestCart.id)
    cookieStore.delete('nova_guest_session')
    return
  }

  // If user has a cart, merge items
  const { data: guestItems } = await adminClient.from('cart_items').select('*').eq('cart_id', guestCart.id)
  if (guestItems && guestItems.length > 0) {
    for (const item of guestItems) {
      // Check if item already exists in user cart
      const { data: existingItem } = await supabase.from('cart_items')
        .select('id, quantity')
        .eq('cart_id', targetCartId)
        .eq('product_variant_id', item.product_variant_id)
        .single()
      
      if (existingItem) {
        await supabase.from('cart_items').update({ quantity: existingItem.quantity + item.quantity }).eq('id', existingItem.id)
      } else {
        await supabase.from('cart_items').insert({ cart_id: targetCartId, product_variant_id: item.product_variant_id, quantity: item.quantity })
      }
    }
  }

  // Delete guest cart
  await adminClient.from('carts').delete().eq('id', guestCart.id)
  cookieStore.delete('nova_guest_session')
}

export async function getCart() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('nova_guest_session')?.value
  
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  let query = adminClient.from('carts').select('id, cart_items(id, quantity, product_variants(id, size, color, price_override, stock_quantity, products(id, title, price, brand, gst_rate, product_images(url, sort_order), stores(id, name))))')
  
  if (user) {
    query = query.eq('customer_id', user.id)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else {
    return []
  }

  let { data, error } = await query.single()

  // Fallback if gst_rate column is missing (migration not applied yet)
  if (error && error.code === '42703') {
    let fallbackQuery = adminClient.from('carts').select('id, cart_items(id, quantity, product_variants(id, size, color, price_override, stock_quantity, products(id, title, price, brand, product_images(url, sort_order), stores(id, name))))')
    if (user) fallbackQuery = fallbackQuery.eq('customer_id', user.id)
    else if (sessionId) fallbackQuery = fallbackQuery.eq('session_id', sessionId)
    
    const fallbackResult = await fallbackQuery.single()
    data = fallbackResult.data
    error = fallbackResult.error
  }

  return data?.cart_items || []
}
