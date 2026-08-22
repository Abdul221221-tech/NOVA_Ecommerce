'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSimilarProducts(productId: string, limit: number = 4) {
  const supabase = await createClient()

  // 1. Fetch the embedding for this product
  const { data: product } = await supabase
    .from('products')
    .select('embedding')
    .eq('id', productId)
    .single()

  if (!product || !product.embedding) {
    return []
  }

  // 2. Query similar products using our pgvector RPC
  const { data: similarProducts, error } = await supabase.rpc('match_products', {
    query_embedding: product.embedding,
    match_threshold: 0.5, // 0.5 is a safe threshold for semantic similarity
    match_count: limit,
    source_product_id: productId
  })

  if (error) {
    console.error('Error fetching similar products:', error)
    return []
  }

  return similarProducts || []
}

export async function getPersonalizedFeed(recentProductIds: string[], limit: number = 10) {
  if (recentProductIds.length === 0) return []
  
  // For the MVP feed, we just base it on the most recently viewed product.
  // A more advanced algorithm would average the embeddings of all recently viewed products.
  const targetId = recentProductIds[0]
  
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('embedding')
    .eq('id', targetId)
    .single()

  if (!product || !product.embedding) {
    // Fallback to random or newest if no embedding exists
    const { data } = await supabase.from('products').select('id, title, price, compare_at_price, stores!inner(name, slug), product_images(url, sort_order)').eq('status', 'active').eq('stores.status', 'approved').order('created_at', { ascending: false }).limit(limit)
    return data || []
  }

  const { data: feedProducts, error } = await supabase.rpc('match_products', {
    query_embedding: product.embedding,
    match_threshold: 0.3, // Lower threshold for feed
    match_count: limit,
    source_product_id: targetId
  })

  if (error) {
    console.error('Error fetching personalized feed:', error)
    return []
  }

  return feedProducts || []
}
