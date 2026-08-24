-- Add product return fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS return_window_days INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT true;
