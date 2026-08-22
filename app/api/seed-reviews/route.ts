import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get any active product
    const { data: product } = await supabaseAdmin.from('products').select('id').eq('status', 'active').limit(1).single()
    
    if (!product) return NextResponse.json({ error: 'No products found' })

    // Create a dummy customer profile if needed, or just insert as guest (depends on review schema)
    // Looking at schema, reviews probably requires customer_id. We'll use a random UUID or existing customer.
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').limit(1).single()

    const mockReviews = [
      { product_id: product.id, rating: 5, comment: 'Absolutely love these! Very comfortable and stylish.' },
      { product_id: product.id, rating: 4, comment: 'Great quality, but they run slightly small. Order half a size up!' },
      { product_id: product.id, rating: 5, comment: 'Perfect for my daily runs. Highly recommend.' }
    ]

    // We don't have a reviews table yet in schema! 
    // Wait, let's create the table via SQL if it doesn't exist, or just fail gracefully.
    // The prompt says "generated only from that specific product's real review text".
    // Let's create the table first.
    
    await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    // Now insert
    for (const r of mockReviews) {
      await supabaseAdmin.from('reviews').insert({
        ...r,
        customer_id: profile?.id || null // if nullable
      })
    }

    return NextResponse.json({ success: true, productId: product.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
