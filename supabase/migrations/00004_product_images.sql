-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own product images" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated users can update own product images" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' AND auth.uid() = owner ) WITH CHECK ( bucket_id = 'product-images' AND auth.uid() = owner );
CREATE POLICY "Authenticated users can delete own product images" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' AND auth.uid() = owner );
