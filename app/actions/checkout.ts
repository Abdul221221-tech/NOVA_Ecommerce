'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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

function getGSTRate(title: string) {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('shirt') || lowerTitle.includes('shoe') || lowerTitle.includes('apparel')) return 12 // 12% GST
  if (lowerTitle.includes('laptop') || lowerTitle.includes('phone') || lowerTitle.includes('electronics')) return 18 // 18% GST
  return 18 // Default 18%
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

  // 2. Get cart items with product details
  const { data: cartItems } = await supabase
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

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty" }
  }

  // 3. Group items by store
  const itemsByStore: Record<string, any[]> = {}
  cartItems.forEach(item => {
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const product = Array.isArray(variant.products) ? variant.products[0] : variant.products
    
    const storeId = product.store_id
    if (!itemsByStore[storeId]) {
      itemsByStore[storeId] = []
    }
    itemsByStore[storeId].push({
      ...item,
      variant,
      product
    })
  })

  // 4. Generate shared order group ID
  const orderGroupId = crypto.randomUUID ? crypto.randomUUID() : 'ord_' + Date.now() + Math.random().toString(36).substring(2, 9)

  // 5. Create orders and order items
  for (const [storeId, items] of Object.entries(itemsByStore)) {
    let storeSubtotal = 0
    let storeGstTotal = 0
    
    items.forEach(item => {
      const price = item.variant.price_override ?? item.product.price
      const itemTotal = price * item.quantity
      storeSubtotal += itemTotal
      
      const gstRate = getGSTRate(item.product.title)
      storeGstTotal += (itemTotal * gstRate) / 100
    })

    // Calculate Store-level discount (pro-rated if multiple stores, but for simplicity applying coupon logic globally or per store)
    let storeDiscount = 0
    if (couponCode) {
      const valid = await validateCouponAction(couponCode, storeSubtotal)
      if (valid.success && valid.discountAmount) {
        storeDiscount = valid.discountAmount
      }
    }

    const storeShipping = storeSubtotal > 500 ? 0 : 40
    
    // Final Calculation: Subtotal + Shipping + GST - Discount
    const storeTotal = storeSubtotal + storeShipping + storeGstTotal - storeDiscount
    
    const platformFee = storeSubtotal * 0.05 // 5% fee
    const sellerPayout = storeTotal - platformFee

    // Embed metadata into JSONB
    const fullShippingMetadata = {
      ...shippingAddress,
      paymentMethod,
      gst: storeGstTotal,
      discount: storeDiscount,
      shipping: storeShipping
    }

    // Insert order bypassing RLS
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        order_group_id: orderGroupId,
        customer_id: user.id,
        store_id: storeId,
        status: 'pending',
        subtotal: storeSubtotal,
        shipping: storeShipping,
        platform_fee: platformFee,
        seller_payout: sellerPayout,
        total: storeTotal,
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
    const orderItemsToInsert = items.map(item => {
      const price = item.variant.price_override ?? item.product.price
      return {
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price_at_purchase: price
      }
    })

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) return { success: false, error: "Failed to create order items: " + itemsError.message }
  }

  // 6. Clear cart
  const { error: clearError } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (clearError) return { success: false, error: "Failed to clear cart: " + clearError.message }

  // 7. Send notification
  try {
    const { createNotification } = await import('@/app/actions/notifications')
    await createNotification(user.id, {
      title: 'Order Confirmed',
      message: `Your order has been placed successfully! We'll notify you when it ships.`,
      type: 'order',
      related_id: orderGroupId
    })
  } catch (err) {
    console.error('Failed to send order notification', err)
  }

  return { success: true, orderGroupId }
}
