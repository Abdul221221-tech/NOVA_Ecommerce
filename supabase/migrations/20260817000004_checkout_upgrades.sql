-- Create user_addresses table
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses."
  ON user_addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons."
  ON coupons FOR SELECT
  USING (is_active = true);

-- Insert dummy coupons for testing
INSERT INTO coupons (code, discount_type, discount_value, min_order_value)
VALUES 
  ('NOVA10', 'percentage', 10.0, 500.0),
  ('WELCOME200', 'fixed', 200.0, 1000.0);

-- Alter products to add gst_rate
ALTER TABLE products
ADD COLUMN gst_rate DECIMAL(5,2) DEFAULT 18.0;

-- Alter orders to add new fields
ALTER TABLE orders
ADD COLUMN discount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN gst DECIMAL(10,2) DEFAULT 0,
ADD COLUMN payment_method TEXT;
