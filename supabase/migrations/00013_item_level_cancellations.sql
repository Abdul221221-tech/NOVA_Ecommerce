-- =========================================================================
-- ITEM-LEVEL CANCELLATIONS & REFUNDS
-- =========================================================================

-- 1. ADD STATUS TO ORDER ITEMS
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- 2. ADD ITEM TRACKING TO CANCELLATIONS AND REFUNDS
ALTER TABLE public.cancellation_requests ADD COLUMN IF NOT EXISTS order_item_ids UUID[] DEFAULT '{}';
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS order_item_ids UUID[] DEFAULT '{}';

-- 3. CREATE ATOMIC RPC FOR ITEM-LEVEL CANCELLATION
CREATE OR REPLACE FUNCTION public.cancel_order_items(
  p_order_id UUID,
  p_user_id UUID,
  p_item_ids UUID[],
  p_reason TEXT,
  p_note TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_invalid_statuses TEXT[] := ARRAY['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
  v_items RECORD;
  v_active_subtotal DECIMAL(10, 2) := 0;
  v_new_shipping DECIMAL(10, 2) := 0;
  v_new_platform_fee DECIMAL(10, 2) := 0;
  v_new_seller_payout DECIMAL(10, 2) := 0;
  v_new_total DECIMAL(10, 2) := 0;
  v_refund_amount DECIMAL(10, 2) := 0;
  v_all_cancelled BOOLEAN := true;
BEGIN
  -- 1. Fetch order and lock it for update
  SELECT * INTO v_order 
  FROM public.orders 
  WHERE id = p_order_id 
  FOR UPDATE;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.customer_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Order does not belong to the user';
  END IF;

  IF v_order.status::TEXT = ANY(v_invalid_statuses) THEN
    RAISE EXCEPTION 'Order cannot be cancelled at this stage (current status: %)', v_order.status;
  END IF;

  -- 2. Mark requested items as cancelled
  UPDATE public.order_items
  SET status = 'cancelled'
  WHERE order_id = p_order_id AND id = ANY(p_item_ids) AND status = 'active';

  -- 3. Calculate new active totals
  SELECT COALESCE(SUM(price_at_purchase * quantity), 0) INTO v_active_subtotal
  FROM public.order_items
  WHERE order_id = p_order_id AND status = 'active';

  -- 4. Calculate new shipping (Free shipping threshold = 500)
  IF v_active_subtotal > 0 THEN
    IF v_active_subtotal >= 500 THEN
      v_new_shipping := 0;
    ELSE
      v_new_shipping := 50;
    END IF;
  ELSE
    v_new_shipping := 0; -- No active items left, shipping is fully refunded
  END IF;

  -- 5. Calculate new fees and total
  v_new_platform_fee := v_active_subtotal * 0.05; -- Assuming 5% platform fee for NOVA
  v_new_seller_payout := v_active_subtotal - v_new_platform_fee;
  v_new_total := v_active_subtotal + v_new_shipping;
  
  -- Calculate refund delta
  v_refund_amount := v_order.total - v_new_total;

  -- 6. Update order with new totals
  IF v_active_subtotal = 0 THEN
    UPDATE public.orders 
    SET status = 'cancelled', subtotal = 0, shipping = 0, platform_fee = 0, seller_payout = 0, total = 0
    WHERE id = p_order_id;
  ELSE
    UPDATE public.orders 
    SET subtotal = v_active_subtotal, shipping = v_new_shipping, platform_fee = v_new_platform_fee, seller_payout = v_new_seller_payout, total = v_new_total
    WHERE id = p_order_id;
  END IF;

  -- 7. Insert Cancellation Request
  INSERT INTO public.cancellation_requests (order_id, user_id, order_item_ids, reason, note, status)
  VALUES (p_order_id, p_user_id, p_item_ids, p_reason, p_note, 'approved');

  -- 8. Insert Order Status History
  IF v_active_subtotal = 0 THEN
    INSERT INTO public.order_status_history (order_id, status, note, created_by)
    VALUES (p_order_id, 'cancelled', 'Entire order cancelled: ' || p_reason, p_user_id);
  ELSE
    INSERT INTO public.order_status_history (order_id, status, note, created_by)
    VALUES (p_order_id, v_order.status, 'Partial cancellation: ' || array_length(p_item_ids, 1) || ' items cancelled. Reason: ' || p_reason, p_user_id);
  END IF;

  -- 9. Handle Refunds for Prepaid Orders
  IF v_order.stripe_payment_intent_id IS NOT NULL AND v_order.stripe_payment_intent_id != 'COD' AND v_refund_amount > 0 THEN
    INSERT INTO public.refunds (order_id, user_id, amount, payment_method, reason, status, order_item_ids)
    VALUES (
      p_order_id, 
      p_user_id, 
      v_refund_amount, 
      COALESCE(v_order.shipping_address->>'paymentMethod', 'Prepaid'), 
      'Items Cancelled: ' || p_reason, 
      'pending',
      p_item_ids
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Items cancelled successfully', 'refund_amount', v_refund_amount, 'new_total', v_new_total);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to cancel items: %', SQLERRM;
END;
$$;
