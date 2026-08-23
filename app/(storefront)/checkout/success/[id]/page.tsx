import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderSuccessClient from '@/components/storefront/OrderSuccessClient'

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup')
  }

  // Fetch order details
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('order_group_id', id)
    .eq('customer_id', user.id)

  if (!orders || orders.length === 0) {
    redirect('/account/orders')
  }

  // Aggregate totals (in case of multiple stores)
  let finalTotal = 0
  let paymentMethod = ''
  let deliveryAddress = ''
  
  orders.forEach(order => {
    finalTotal += order.total
    if (order.shipping_address) {
      paymentMethod = order.shipping_address.paymentMethod || 'Prepaid'
      const addr = order.shipping_address
      deliveryAddress = `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}`
    }
  })

  // Estimated Delivery (3-5 days from order date)
  const orderDate = new Date(orders[0].created_at)
  const minDate = new Date(orderDate)
  minDate.setDate(orderDate.getDate() + 3)
  const maxDate = new Date(orderDate)
  maxDate.setDate(orderDate.getDate() + 5)
  const estimatedDelivery = `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <OrderSuccessClient 
      id={id}
      finalTotal={finalTotal}
      paymentMethod={paymentMethod}
      estimatedDelivery={estimatedDelivery}
      deliveryAddress={deliveryAddress}
    />
  )
}
