-- Add model_url to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_url TEXT;

-- Create product-models bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-models', 'product-models', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for product-models
CREATE POLICY "Public can read product models" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-models');

CREATE POLICY "Users can upload product models" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-models' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own product models" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-models' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own product models" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-models' AND auth.role() = 'authenticated');
