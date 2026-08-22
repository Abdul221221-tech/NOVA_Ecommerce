-- =========================================================================
-- ATOMIC ORDER CANCELLATION RPC
-- =========================================================================

CREATE OR REPLACE FUNCTION public.cancel_order_atomic(
  p_order_id UUID,
  p_user_id UUID,
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
BEGIN
  -- 1. Fetch order and lock it for update
  SELECT * INTO v_order 
  FROM public.orders 
  WHERE id = p_order_id 
  FOR UPDATE;

  -- 2. Validate Order Exists
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- 3. Validate User Ownership (Only the customer can cancel)
  IF v_order.customer_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Order does not belong to the user';
  END IF;

  -- 4. Validate Status
  IF v_order.status::TEXT = ANY(v_invalid_statuses) THEN
    RAISE EXCEPTION 'Order cannot be cancelled at this stage (current status: %)', v_order.status;
  END IF;

  -- 5. Insert Cancellation Request
  INSERT INTO public.cancellation_requests (order_id, user_id, reason, note, status)
  VALUES (p_order_id, p_user_id, p_reason, p_note, 'approved');

  -- 6. Update Order Status
  UPDATE public.orders 
  SET status = 'cancelled'
  WHERE id = p_order_id;

  -- 7. Insert Order Status History
  INSERT INTO public.order_status_history (order_id, status, note, created_by)
  VALUES (p_order_id, 'cancelled', 'Cancelled by user: ' || p_reason, p_user_id);

  -- 8. Handle Refunds for Prepaid Orders
  IF v_order.stripe_payment_intent_id IS NOT NULL AND v_order.stripe_payment_intent_id != 'COD' THEN
    INSERT INTO public.refunds (order_id, user_id, amount, payment_method, reason, status)
    VALUES (
      p_order_id, 
      p_user_id, 
      v_order.total, 
      COALESCE(v_order.shipping_address->>'paymentMethod', 'Prepaid'), 
      'Order Cancelled: ' || p_reason, 
      'pending'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Order cancelled successfully');
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic on exception in plpgsql
    RAISE EXCEPTION 'Failed to cancel order: %', SQLERRM;
END;
$$;
