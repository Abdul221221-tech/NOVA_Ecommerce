-- 1. Add brand column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;

-- 2. Update the fuzzy search RPC to include brand searching
CREATE OR REPLACE FUNCTION search_products_fuzzy(search_term TEXT)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM products p
  WHERE p.title % search_term 
     OR p.description % search_term 
     OR p.brand % search_term
  ORDER BY GREATEST(
    similarity(p.title, search_term), 
    similarity(p.description, search_term), 
    similarity(COALESCE(p.brand, ''), search_term)
  ) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
