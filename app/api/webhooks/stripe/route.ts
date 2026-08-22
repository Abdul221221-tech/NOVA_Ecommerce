import { NextResponse } from 'next/server'
import { stripe, PLATFORM_FEE_PERCENTAGE } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Webhook needs admin privileges
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any
    const { cartId, orderGroupId, customerId } = paymentIntent.metadata

    if (!cartId || !orderGroupId) {
      console.error('Missing metadata in PaymentIntent')
      return NextResponse.json({ received: true }) // Acknowledge to stop retries
    }

    // 1. Fetch Cart Items
    const { data: cartItems } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id, quantity, product_variant_id,
        product_variants (
          id, price_override, stock_quantity,
          products (
            id, price, store_id,
            stores ( id, stripe_connect_account_id )
          )
        )
      `)
      .eq('cart_id', cartId)

    if (!cartItems || cartItems.length === 0) return NextResponse.json({ received: true })

    // 2. Group by Store
    const storeOrders: Record<string, any> = {}

    cartItems.forEach((item: any) => {
      const variant = item.product_variants
      const product = variant.products
      const store = product.stores
      const price = variant.price_override ?? product.price

      // Skip items without a connected account (they shouldn't have been charged anyway)
      if (!store.stripe_connect_account_id) return

      if (!storeOrders[store.id]) {
        storeOrders[store.id] = {
          storeId: store.id,
          stripeAccountId: store.stripe_connect_account_id,
          subtotal: 0,
          items: []
        }
      }

      storeOrders[store.id].subtotal += (price * item.quantity)
      storeOrders[store.id].items.push({
        variantId: variant.id,
        quantity: item.quantity,
        priceAtPurchase: price,
        currentStock: variant.stock_quantity
      })
    })

    // 3. Process each Store Order
    for (const [storeId, orderData] of Object.entries(storeOrders)) {
      const subtotal = orderData.subtotal
      const platformFee = subtotal * PLATFORM_FEE_PERCENTAGE
      const sellerPayout = subtotal - platformFee

      // Create Order Row
      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          order_group_id: orderGroupId,
          customer_id: customerId === 'guest' ? null : customerId,
          store_id: storeId,
          status: 'paid',
          subtotal,
          shipping: 0, // Simplified for Phase 5
          platform_fee: platformFee,
          seller_payout: sellerPayout,
          total: subtotal, // Assuming no shipping
          stripe_payment_intent_id: paymentIntent.id
        })
        .select('id')
        .single()

      if (orderError || !newOrder) {
        console.error('Failed to create order for store', storeId, orderError)
        continue
      }

      // Insert Order Items & Decrement Stock
      for (const item of orderData.items) {
        await supabaseAdmin.from('order_items').insert({
          order_id: newOrder.id,
          product_variant_id: item.variantId,
          quantity: item.quantity,
          price_at_purchase: item.priceAtPurchase
        })

        // Decrement stock
        const newStock = Math.max(0, item.currentStock - item.quantity)
        await supabaseAdmin.from('product_variants').update({ stock_quantity: newStock }).eq('id', item.variantId)
      }

      // 4. Trigger Stripe Transfer
      try {
        await stripe.transfers.create({
          amount: Math.round(sellerPayout * 100),
          currency: 'usd',
          destination: orderData.stripeAccountId,
          transfer_group: orderGroupId,
        })
      } catch (transferError) {
        console.error('Stripe Transfer failed for store', storeId, transferError)
        // Log this to a dead-letter queue or alert platform admin for manual retry
      }
    }

    // 5. Clear the Cart
    await supabaseAdmin.from('carts').delete().eq('id', cartId)
  }

  return NextResponse.json({ received: true })
}
