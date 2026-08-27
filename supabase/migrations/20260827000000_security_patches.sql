-- ====================================================================
-- SECURITY PATCHES
-- ====================================================================

-- 1. Privilege Escalation to Platform Admin (CRITICAL)
-- Prevent users from updating the `role` column in the `profiles` table
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'You do not have permission to change your role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();


-- 2. Seller Store Approval Bypass (HIGH)
-- Prevent sellers from updating `status` or `suspension_reason` on their stores
CREATE OR REPLACE FUNCTION public.protect_store_status()
RETURNS trigger AS $$
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status) OR (NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason) THEN
    IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'You do not have permission to modify store status or suspension reason.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_store_status_trigger ON public.stores;
CREATE TRIGGER protect_store_status_trigger
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_store_status();


-- 3. Open Modification of Search Analytics (MEDIUM)
-- Drop permissive UPDATE/SELECT policies on search_queries
DROP POLICY IF EXISTS "Anyone can update search_queries" ON public.search_queries;
DROP POLICY IF EXISTS "Anyone can read search_queries" ON public.search_queries;

CREATE POLICY "Admins can read search_queries"
  ON public.search_queries FOR SELECT
  USING (public.is_admin());


-- 4. Review Spoofing / Fake Reviews (MEDIUM)
-- Ensure customers can only review products they actually purchased
DROP POLICY IF EXISTS "Customers can create reviews" ON reviews;
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN product_variants pv ON oi.product_variant_id = pv.id
      WHERE o.customer_id = auth.uid() 
        AND pv.product_id = reviews.product_id
    )
  );


-- 5. Unrestricted Storage Bucket Uploads (LOW)
-- Enforce that uploaded files must start with the user UUID to prevent spoofing/spamming

-- Avatars
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND name LIKE (auth.uid()::text || '-%'));

-- Store Logos
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload logos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'store-logos' AND auth.role() = 'authenticated' AND name LIKE (auth.uid()::text || '-%'));

-- Product Images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND name LIKE (auth.uid()::text || '-%'));

-- Product Models
DROP POLICY IF EXISTS "Users can upload product models" ON storage.objects;
CREATE POLICY "Users can upload product models" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-models' AND auth.role() = 'authenticated' AND name LIKE (auth.uid()::text || '-%'));
