CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'platform_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to check if current user is seller for a specific store
CREATE OR REPLACE FUNCTION public.is_store_owner(store_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores 
    WHERE id = store_id AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Users can read their own profile. Admins can read all.
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Stores: Anyone can read approved stores. Owners and admins can read/update all their stores.
CREATE POLICY "Anyone can read approved stores" ON stores FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners can view own stores" ON stores FOR SELECT USING (owner_id = auth.uid() OR is_admin());
CREATE POLICY "Sellers can create stores" ON stores FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.get_user_role() IN ('seller', 'platform_admin'));
CREATE POLICY "Owners can update own stores" ON stores FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

-- Categories: Anyone can read. Only admins can write.
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

-- Products: Anyone can read active products. Owners and admins can manage.
CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can manage own products" ON products FOR ALL USING (is_store_owner(store_id) OR is_admin());

-- Product Variants: Anyone can read. Owners/admins can manage.
CREATE POLICY "Anyone can read variants" ON product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (p.status = 'active' OR is_store_owner(p.store_id) OR is_admin()))
);
CREATE POLICY "Owners can manage own variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (is_store_owner(p.store_id) OR is_admin()))
);

-- Product Images: Anyone can read. Owners/admins manage.
CREATE POLICY "Anyone can read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Owners can manage own product images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND (is_store_owner(p.store_id) OR is_admin()))
);

-- Reviews: Anyone can read. Customers can insert for themselves. Customers can update/delete their own.
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can manage own reviews" ON reviews FOR UPDATE USING (auth.uid() = customer_id OR is_admin());
CREATE POLICY "Customers can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = customer_id OR is_admin());

-- Carts: Customers can manage their own carts.
CREATE POLICY "Customers manage own cart" ON carts FOR ALL USING (
  (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR is_admin()
);

-- Cart Items: Tied to carts policy
CREATE POLICY "Customers manage own cart items" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND ((auth.uid() IS NOT NULL AND c.customer_id = auth.uid()) OR is_admin()))
);

-- Orders: Customers can read own. Sellers can read own store's orders. Admins can read all.
CREATE POLICY "Customers read own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Sellers read own store orders" ON orders FOR SELECT USING (is_store_owner(store_id));
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (is_admin());

-- Order Items: Tied to orders policy
CREATE POLICY "Customers read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
);
CREATE POLICY "Sellers read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND is_store_owner(o.store_id))
);
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (is_admin());
