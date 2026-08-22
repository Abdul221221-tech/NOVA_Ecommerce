export function calculateEligibility(
  order: any, 
  orderItem: any, 
  existingReturnRequests: any[], 
  existingExchangeRequests: any[]
) {
  // If order is not delivered, we don't process returns/exchanges yet.
  if (order.status !== 'delivered') {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'Order is not delivered yet.',
      daysRemaining: 0
    }
  }

  // Find delivery date
  const deliveryEntry = order.order_status_history?.find((h: any) => h.status === 'delivered')
  if (!deliveryEntry) {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'Delivery date not found.',
      daysRemaining: 0
    }
  }

  const deliveryDate = new Date(deliveryEntry.created_at)
  const currentDate = new Date()

  // Get return window from product or default to 7
  // Assume product has return_window_days, otherwise 7
  const returnWindowDays = orderItem.product_variants?.products?.return_window_days ?? 7
  
  const expiryDate = new Date(deliveryDate)
  expiryDate.setDate(expiryDate.getDate() + returnWindowDays)
  
  const isExpired = currentDate > expiryDate
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))

  // Check if there is already a return request for this item
  const hasReturn = existingReturnRequests?.some(r => r.order_item_id === orderItem.id && !['rejected', 'cancelled'].includes(r.status))
  const hasExchange = existingExchangeRequests?.some(r => r.order_item_id === orderItem.id && !['rejected', 'cancelled'].includes(r.status))

  if (hasReturn) {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'Return already requested for this item.',
      daysRemaining
    }
  }

  if (hasExchange) {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'Exchange already requested for this item.',
      daysRemaining
    }
  }

  if (isExpired) {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'Return window expired.',
      daysRemaining: 0
    }
  }

  // Check if product is marked non-returnable (assuming we have a flag, if not we assume true)
  const isReturnable = orderItem.product_variants?.products?.is_returnable !== false

  if (!isReturnable) {
    return {
      canReturn: false,
      canExchange: false,
      reason: 'This product is not eligible for return or exchange.',
      daysRemaining
    }
  }

  return {
    canReturn: true,
    canExchange: true,
    reason: `Return available until ${expiryDate.toLocaleDateString()}`,
    daysRemaining
  }
}
