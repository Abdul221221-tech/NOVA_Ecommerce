-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Add a column to the products table to store the 768-dimensional vector (Google text-embedding-004)
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create a function to similarity search for products
CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  source_product_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  price numeric,
  compare_at_price numeric,
  similarity float,
  store_name text,
  store_slug text,
  primary_image text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.price,
    p.compare_at_price,
    1 - (p.embedding <=> query_embedding) AS similarity,
    s.name as store_name,
    s.slug as store_slug,
    (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order ASC LIMIT 1) as primary_image
  FROM products p
  JOIN stores s ON s.id = p.store_id
  WHERE p.id != source_product_id
    AND p.status = 'active'
    AND s.status = 'approved'
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;
