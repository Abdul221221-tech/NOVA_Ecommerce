import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const { promoCode } = await req.json().catch(() => ({ promoCode: null }))
    
    // Resolve Cart ID
    let cartId: string | null = null
    if (user) {
      const { data } = await supabase.from('carts').select('id').eq('customer_id', user.id).single()
      cartId = data?.id
    } else {
      const sessionId = cookieStore.get('cart_session')?.value
      if (sessionId) {
        const { data } = await supabase.from('carts').select('id').eq('session_id', sessionId).single()
        cartId = data?.id
      }
    }

    if (!cartId) return NextResponse.json({ error: 'Cart not found' }, { status: 400 })

    // Fetch Cart Items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id, quantity,
        product_variants (
          id, price_override,
          products (
            id, price,
            stores ( id, stripe_connect_account_id )
          )
        )
      `)
      .eq('cart_id', cartId)

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate Stock and Compute Total
    let amountTotal = 0
    let validItemCount = 0
    const outOfStockItems: string[] = []

    for (const item of cartItems) {
      const variant = item.product_variants as any
      if (!variant || variant.products.status !== 'active') continue

      const store = variant.products.stores
      if (!store.stripe_connect_account_id) continue // ONLY items from connected sellers

      // Stock validation bypassed per user request

      const price = variant.price_override ?? variant.products.price
      amountTotal += (price * item.quantity)
      validItemCount++
    }

    if (outOfStockItems.length > 0) {
      return NextResponse.json({ error: `Cannot proceed: ${outOfStockItems.join(', ')}` }, { status: 400 })
    }

    if (validItemCount === 0) {
      return NextResponse.json({ error: 'No checkout-eligible items in cart' }, { status: 400 })
    }

    // Apply Promo Code Logic
    let discountAmount = 0
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (promo) {
        // Check if expired
        const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
        const hasStarted = new Date(promo.starts_at) <= new Date()

        if (!isExpired && hasStarted) {
          // Calculate the subtotal for the SPECIFIC store that issued the promo
          let storeSubtotal = 0
          cartItems.forEach((item: any) => {
            const variant = item.product_variants
            const product = variant.products
            if (product.stores.id === promo.store_id) {
              const price = variant.price_override ?? product.price
              storeSubtotal += (price * item.quantity)
            }
          })

          if (storeSubtotal > 0) {
            if (promo.discount_type === 'percentage') {
              discountAmount = storeSubtotal * (promo.value / 100)
            } else if (promo.discount_type === 'fixed') {
              discountAmount = Math.min(promo.value, storeSubtotal) // Can't discount more than the store subtotal
            }
          }
        }
      }
    }

    const finalAmount = Math.max(0, amountTotal - discountAmount)

    // Create a deterministic order group ID
    const orderGroupId = crypto.randomUUID()
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'usd',
      transfer_group: orderGroupId, // CRITICAL for Separate Charges and Transfers
      metadata: {
        cartId: cartId,
        orderGroupId: orderGroupId,
        customerId: user?.id || 'guest'
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderGroupId,
      discountAmount,
      finalAmount
    })
  } catch (err: any) {
    console.error('PaymentIntent Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
