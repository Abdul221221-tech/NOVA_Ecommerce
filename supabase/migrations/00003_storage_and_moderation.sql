-- Add suspension_reason to stores
ALTER TABLE public.stores ADD COLUMN suspension_reason TEXT;

-- Update products RLS to ensure pending seller products are not public
-- Drop the existing policy first
DROP POLICY IF EXISTS "Anyone can read active products" ON products;

-- Recreate policy requiring store to be approved for public viewing
CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (
  status = 'active' AND 
  EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.status = 'approved')
);

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('store-logos', 'store-logos', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'store-logos' );
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'store-logos' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated users can update own logos" ON storage.objects FOR UPDATE USING ( bucket_id = 'store-logos' AND auth.uid() = owner ) WITH CHECK ( bucket_id = 'store-logos' AND auth.uid() = owner );
CREATE POLICY "Authenticated users can delete own logos" ON storage.objects FOR DELETE USING ( bucket_id = 'store-logos' AND auth.uid() = owner );
