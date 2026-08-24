/**
 * NOVA Pricing & Tax Engine
 * Centralizes all GST, Shipping, and Platform Fee calculations to ensure consistency.
 */

export const PRICING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 500, // ₹500 per store
  STANDARD_SHIPPING_FEE: 40,
  PLATFORM_FEE_PERCENTAGE: 0.05, // 5%
  DEFAULT_GST_RATE: 18.0, 
}

export interface OrderItem {
  price: number;
  quantity: number;
  gst_rate?: number | null; // From products.gst_rate
  title?: string;
}

export interface StoreTotals {
  storeId: string;
  storeName?: string;
  merchandiseSubtotal: number;
  shipping: number;
  gst: number;
  platformFee: number;
  sellerPayout: number;
  total: number;
  discount: number;
}

export interface GlobalTotals {
  globalSubtotal: number;
  globalShipping: number;
  globalGst: number;
  globalDiscount: number;
  globalTotal: number;
  storeTotals: StoreTotals[];
}

export function calculateStoreTotals(
  storeId: string, 
  items: OrderItem[], 
  storeDiscountAmount: number = 0,
  storeName?: string
): StoreTotals {
  let merchandiseSubtotal = 0;
  let gst = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    merchandiseSubtotal += itemTotal;
    
    // Explicit warning if a product is missing its GST rate
    if (typeof item.gst_rate !== 'number') {
      console.warn(`Product missing GST rate! Using fallback 18% but this should be configured. ${item.title ? `(${item.title})` : ''}`);
    }

    const actualRate = typeof item.gst_rate === 'number' ? item.gst_rate : PRICING_CONFIG.DEFAULT_GST_RATE;
    gst += (itemTotal * actualRate) / 100;
  }

  // Shipping logic: ₹500 threshold per store
  const shipping = merchandiseSubtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD 
    ? 0 
    : PRICING_CONFIG.STANDARD_SHIPPING_FEE;

  // Final Calculation: Subtotal + Shipping + GST - Discount
  const total = merchandiseSubtotal + shipping + gst - storeDiscountAmount;
  
  // Platform fee: 5% of merchandise subtotal ONLY (not including GST or shipping)
  const platformFee = merchandiseSubtotal * PRICING_CONFIG.PLATFORM_FEE_PERCENTAGE;
  
  // Seller payout: customer total minus platform fee
  const sellerPayout = total - platformFee;

  return {
    storeId,
    storeName,
    merchandiseSubtotal,
    shipping,
    gst,
    platformFee,
    sellerPayout,
    total,
    discount: storeDiscountAmount,
  };
}

export function calculateGlobalTotals(
  itemsByStore: Record<string, { storeName: string, items: OrderItem[] }>, 
  globalDiscountAmount: number = 0
): GlobalTotals {
  
  // 1. First pass to calculate global merchandise subtotal (needed for discount prorating)
  let globalSubtotal = 0;
  for (const store of Object.values(itemsByStore)) {
    for (const item of store.items) {
      globalSubtotal += item.price * item.quantity;
    }
  }

  const storeTotals: StoreTotals[] = [];
  let globalShipping = 0;
  let globalGst = 0;
  let globalTotal = 0;

  // 2. Second pass to calculate individual store totals
  for (const [storeId, store] of Object.entries(itemsByStore)) {
    let storeSubtotal = 0;
    for (const item of store.items) {
      storeSubtotal += item.price * item.quantity;
    }

    // Pro-rate the global discount based on this store's share of the global subtotal
    const storeShare = globalSubtotal > 0 ? storeSubtotal / globalSubtotal : 0;
    const storeDiscount = Math.round(globalDiscountAmount * storeShare * 100) / 100;

    const totals = calculateStoreTotals(storeId, store.items, storeDiscount, store.storeName);
    
    storeTotals.push(totals);
    globalShipping += totals.shipping;
    globalGst += totals.gst;
    globalTotal += totals.total;
  }

  return {
    globalSubtotal,
    globalShipping,
    globalGst,
    globalDiscount: globalDiscountAmount,
    globalTotal,
    storeTotals
  };
}
