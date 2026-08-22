-- =========================================================================
-- ORDER MANAGEMENT SYSTEM (OMS) MIGRATION
-- =========================================================================

-- 1. ADD NEW STATUSES TO order_status ENUM
-- We use a DO block to safely add values without failing if they exist
DO $$ 
BEGIN
  BEGIN
    ALTER TYPE order_status ADD VALUE 'confirmed' AFTER 'pending';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'packed' AFTER 'confirmed';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'out_for_delivery' AFTER 'shipped';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'return_requested';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'return_approved';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'return_rejected';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'exchange_requested';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'exchange_approved';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'exchange_rejected';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'refund_initiated';
  EXCEPTION WHEN duplicate_object THEN null; END;
  BEGIN
    ALTER TYPE order_status ADD VALUE 'refund_completed';
  EXCEPTION WHEN duplicate_object THEN null; END;
END $$;


-- =========================================================================
-- 2. ORDER STATUS HISTORY
-- Tracks the timeline of order state changes
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view own order history') THEN
    CREATE POLICY "Customers can view own order history" ON public.order_status_history FOR SELECT 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.customer_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can view and insert history for their orders') THEN
    CREATE POLICY "Sellers can view and insert history for their orders" ON public.order_status_history FOR ALL 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
  END IF;
END $$;


-- =========================================================================
-- 3. CANCELLATION REQUESTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'approved', -- mostly auto-approved for pre-shipment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers manage own cancellations') THEN
    CREATE POLICY "Customers manage own cancellations" ON public.cancellation_requests FOR ALL 
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers view their cancellations') THEN
    CREATE POLICY "Sellers view their cancellations" ON public.cancellation_requests FOR SELECT 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = cancellation_requests.order_id AND orders.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
  END IF;
END $$;


-- =========================================================================
-- 4. RETURN REQUESTS (Per Item Level Supported)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
  images JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers manage own returns') THEN
    CREATE POLICY "Customers manage own returns" ON public.return_requests FOR ALL 
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers manage their returns') THEN
    CREATE POLICY "Sellers manage their returns" ON public.return_requests FOR ALL 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = return_requests.order_id AND orders.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
  END IF;
END $$;


-- =========================================================================
-- 5. EXCHANGE REQUESTS (Per Item Level Supported)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requested_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers manage own exchanges') THEN
    CREATE POLICY "Customers manage own exchanges" ON public.exchange_requests FOR ALL 
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers manage their exchanges') THEN
    CREATE POLICY "Sellers manage their exchanges" ON public.exchange_requests FOR ALL 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = exchange_requests.order_id AND orders.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
  END IF;
END $$;


-- =========================================================================
-- 6. REFUNDS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  refund_method TEXT NOT NULL DEFAULT 'original_payment',
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, initiated, completed, rejected
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers view own refunds') THEN
    CREATE POLICY "Customers view own refunds" ON public.refunds FOR SELECT 
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers view their order refunds') THEN
    CREATE POLICY "Sellers view their order refunds" ON public.refunds FOR SELECT 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
  END IF;
END $$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_return_requests_modtime ON public.return_requests;
CREATE TRIGGER update_return_requests_modtime
BEFORE UPDATE ON public.return_requests
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_exchange_requests_modtime ON public.exchange_requests;
CREATE TRIGGER update_exchange_requests_modtime
BEFORE UPDATE ON public.exchange_requests
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
