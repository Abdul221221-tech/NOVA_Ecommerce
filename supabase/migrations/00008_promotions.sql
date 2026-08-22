CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  discount_type discount_type NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public can read active promotions
DROP POLICY IF EXISTS "Public can read active promotions" ON promotions;
CREATE POLICY "Public can read active promotions" ON promotions
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Sellers can manage their own promotions
DROP POLICY IF EXISTS "Sellers manage own promotions" ON promotions;
CREATE POLICY "Sellers manage own promotions" ON promotions
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );
