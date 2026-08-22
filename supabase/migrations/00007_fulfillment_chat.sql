-- 1. Modify orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 2. Modify order_status ENUM
-- Note: Altering ENUM in postgres cannot be done inside a transaction block in some versions,
-- but since this is a simple script, we'll execute it directly.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'disputed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'returned';

-- 3. Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS Policies for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages for their own orders, and sellers can view messages for orders to their store
DROP POLICY IF EXISTS "View messages" ON messages;
CREATE POLICY "View messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = messages.order_id 
      AND (o.customer_id = auth.uid() OR o.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    )
  );

-- Customers and sellers can insert messages for their respective orders
DROP POLICY IF EXISTS "Insert messages" ON messages;
CREATE POLICY "Insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = messages.order_id 
      AND (o.customer_id = auth.uid() OR o.store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    )
  );
