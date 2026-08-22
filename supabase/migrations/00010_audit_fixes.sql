-- 1. Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add brand to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;

-- 3. Create wishlists table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- 4. Create an RPC for fuzzy product search (returns product IDs)
CREATE OR REPLACE FUNCTION search_products_fuzzy(search_term TEXT)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM products p
  WHERE p.title % search_term OR p.description % search_term
  ORDER BY GREATEST(similarity(p.title, search_term), similarity(p.description, search_term)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
