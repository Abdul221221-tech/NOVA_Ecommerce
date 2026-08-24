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
    const paymentIntentId = paymentIntent.id
    
    // Find orders with this payment intent ID
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, store_id, seller_payout, order_group_id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      
    if (error || !orders || orders.length === 0) {
      console.error('Failed to find orders for payment intent', paymentIntentId)
      return NextResponse.json({ received: true }) // Acknowledge to stop retries
    }

    // Update all matching orders to 'paid'
    for (const order of orders) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id)
        
      // Add history entry
      await supabaseAdmin
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'paid',
          note: 'Payment successful via Stripe',
          created_by: null // System
        })
        
      // Attempt Stripe Transfer to seller (Optional / Phase 5)
      try {
        const { data: store } = await supabaseAdmin
          .from('stores')
          .select('stripe_connect_account_id')
          .eq('id', order.store_id)
          .single()
          
        if (store && store.stripe_connect_account_id) {
          await stripe.transfers.create({
            amount: Math.round(order.seller_payout * 100),
            currency: 'inr',
            destination: store.stripe_connect_account_id,
            transfer_group: order.order_group_id,
          })
        }
      } catch (transferError) {
        console.error('Stripe Transfer failed for store', order.store_id, transferError)
      }
    }
    
    // Notify Customer
    if (orders.length > 0) {
      try {
        const orderGroupId = orders[0].order_group_id;
        const { data: firstOrder } = await supabaseAdmin.from('orders').select('customer_id').eq('id', orders[0].id).single();
        if (firstOrder?.customer_id) {
          const { createNotification } = await import('@/app/actions/notifications');
          await createNotification(firstOrder.customer_id, {
            title: 'Payment Successful',
            message: `Payment for Order #${orderGroupId.split('-')[0]} has been successfully received.`,
            type: 'payment',
            related_id: orderGroupId,
            icon: 'CheckCircle'
          });
          
          // Notify Sellers
          for (const order of orders) {
             const { data: store } = await supabaseAdmin.from('stores').select('owner_id').eq('id', order.store_id).single();
             if (store?.owner_id) {
               await createNotification(store.owner_id, {
                 title: 'Payment Confirmed',
                 message: `Payment for Order #${orderGroupId.split('-')[0]} was successful. You can start fulfilling the order.`,
                 type: 'payment',
                 related_id: order.id,
                 icon: 'CheckCircle',
                 href: `/seller/orders/${order.id}`
               });
             }
          }
        }
      } catch(e) {
        console.error('Failed to notify payment success', e);
      }
    }
  }

  return NextResponse.json({ received: true })
}
