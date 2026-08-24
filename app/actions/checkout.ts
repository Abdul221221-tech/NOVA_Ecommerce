'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

// Hardcoded coupons for conceptual flow
const VALID_COUPONS: Record<string, { type: 'percentage' | 'fixed', value: number, minOrder: number }> = {
  'NOVA10': { type: 'percentage', value: 10, minOrder: 500 },
  'NOVA20': { type: 'percentage', value: 20, minOrder: 1500 },
  'WELCOME200': { type: 'fixed', value: 200, minOrder: 1000 },
}

export async function validateCouponAction(code: string, subtotal: number) {
  const coupon = VALID_COUPONS[code.toUpperCase()]
  if (!coupon) {
    return { success: false, error: 'Invalid coupon code' }
  }
  if (subtotal < coupon.minOrder) {
    return { success: false, error: `Minimum order value of ₹${coupon.minOrder} required` }
  }
  
  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = (subtotal * coupon.value) / 100
  } else {
    discountAmount = coupon.value
  }
  
  return { success: true, discountAmount, code: code.toUpperCase() }
}



export async function placeOrder(shippingAddress: any, couponCode: string | null, paymentMethod: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Authentication required" }
  }

  // Admin client to bypass RLS on orders/order_items (since customers lack INSERT policies)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Removed invalid profiles table update (columns don't exist in schema)

  // 1. Get user's cart
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('customer_id', user.id)
    .single()

  if (!cart) {
    return { success: false, error: "No active cart found" }
  }

  let cartItemsQuery = supabase
    .from('cart_items')
    .select(`
      id, quantity, product_variant_id,
      product_variants (
        id, price_override,
        products (
          id, title, price, store_id, gst_rate
        )
      )
    `)
    .eq('cart_id', cart.id)
    
  let { data: cartItems, error: itemsError } = await cartItemsQuery

  if (itemsError && itemsError.code === '42703') {
    const { data: fallbackItems } = await supabase
      .from('cart_items')
      .select(`
        id, quantity, product_variant_id,
        product_variants (
          id, price_override,
          products (
            id, title, price, store_id
          )
        )
      `)
      .eq('cart_id', cart.id)
    cartItems = fallbackItems
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty" }
  }

// 3. Group items by store for calculation
  const inputItemsByStore: Record<string, { storeName: string, items: any[] }> = {}
  cartItems.forEach(item => {
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const product = Array.isArray(variant.products) ? variant.products[0] : variant.products
    
    const storeId = product.store_id
    if (!inputItemsByStore[storeId]) {
      inputItemsByStore[storeId] = { storeName: storeId, items: [] }
    }
    inputItemsByStore[storeId].items.push({
      price: variant.price_override ?? product.price,
      quantity: item.quantity,
      gst_rate: product.gst_rate,
      title: product.title,
      product_variant_id: item.product_variant_id
    })
  })

  // 4. Generate shared order group ID
  const orderGroupId = crypto.randomUUID ? crypto.randomUUID() : 'ord_' + Date.now() + Math.random().toString(36).substring(2, 9)

  // Calculate global subtotal first for accurate coupon validation
  let rawGlobalSubtotal = 0;
  for (const store of Object.values(inputItemsByStore)) {
    for (const item of store.items) {
      rawGlobalSubtotal += item.price * item.quantity
    }
  }

  // Validate coupon globally
  let globalDiscountAmount = 0;
  if (couponCode) {
    const valid = await validateCouponAction(couponCode, rawGlobalSubtotal)
    if (valid.success && valid.discountAmount) {
      globalDiscountAmount = valid.discountAmount
    }
  }

  // Calculate pricing through centralized engine
  const pricingConfig = (await import('@/lib/pricing')).calculateGlobalTotals(inputItemsByStore, globalDiscountAmount)

  // 5. Create orders and order items
  for (const storeTotals of pricingConfig.storeTotals) {
    const storeId = storeTotals.storeId;
    const items = inputItemsByStore[storeId].items;

    // Embed metadata into JSONB
    const fullShippingMetadata = {
      ...shippingAddress,
      paymentMethod,
      gst: storeTotals.gst,
      discount: storeTotals.discount,
      shipping: storeTotals.shipping
    }

    // Insert order bypassing RLS
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        order_group_id: orderGroupId,
        customer_id: user.id,
        store_id: storeId,
        status: 'pending',
        subtotal: storeTotals.merchandiseSubtotal,
        shipping: storeTotals.shipping,
        platform_fee: storeTotals.platformFee,
        seller_payout: storeTotals.sellerPayout,
        total: storeTotals.total,
        shipping_address: fullShippingMetadata,
        stripe_payment_intent_id: paymentMethod === 'COD' ? 'COD' : `mock_pi_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)}`
      })
      .select('id')
      .single()

    if (orderError) return { success: false, error: "Failed to create order: " + orderError.message }

    // Log initial status
    await adminClient.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      note: 'Order placed',
      created_by: user.id
    })

    // Insert order items
    const orderItemsToInsert = items.map(item => ({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }))

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) return { success: false, error: "Failed to create order items: " + itemsError.message }
  }

  let clientSecret = null;
  if (paymentMethod !== 'COD') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricingConfig.globalTotal * 100),
      currency: 'inr',
      metadata: {
        orderGroupId: orderGroupId,
        customerId: user.id
      }
    });
    clientSecret = paymentIntent.client_secret;

    // Update orders with real payment intent ID
    await adminClient.from('orders').update({ stripe_payment_intent_id: paymentIntent.id }).eq('order_group_id', orderGroupId);
  }

  // 6. Clear cart
  const { error: clearError } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (clearError) return { success: false, error: "Failed to clear cart: " + clearError.message }

  // 7. Send notification to Customer
  try {
    const { createNotification } = await import('@/app/actions/notifications')
    await createNotification(user.id, {
      title: 'Order Placed Successfully',
      message: `Your order #${orderGroupId.split('-')[0]} has been confirmed! We'll notify you when it ships.`,
      type: 'order',
      related_id: orderGroupId,
      icon: 'Package'
    })

    // Send notifications to Sellers
    for (const storeTotals of pricingConfig.storeTotals) {
      const storeId = storeTotals.storeId;
      const { data: store } = await adminClient.from('stores').select('owner_id').eq('id', storeId).single()
      if (store?.owner_id) {
        // Find the specific order for this store to link to it directly
        const { data: order } = await adminClient.from('orders').select('id').eq('order_group_id', orderGroupId).eq('store_id', storeId).single()
        
        await createNotification(store.owner_id, {
          title: 'New Order Received!',
          message: `You have received a new order. Please review and process it.`,
          type: 'order',
          related_id: order?.id || orderGroupId,
          icon: 'Package',
          href: order?.id ? `/seller/orders/${order.id}` : '/seller/orders'
        })
      }
    }
  } catch (err) {
    console.error('Failed to send order notifications', err)
  }

  return { success: true, orderGroupId, clientSecret }
}
