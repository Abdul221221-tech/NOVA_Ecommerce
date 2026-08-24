'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { embed, generateText } from 'ai'
import { google } from '@ai-sdk/google'

async function getSellerStore() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') throw new Error('Unauthorized: Store not approved')
  
  return { supabase, storeId: store.id }
}

export type ProductPayload = {
  id?: string
  title: string
  description: string
  price: number
  compare_at_price?: number | null
  status: 'draft' | 'active' | 'archived'
  category_id?: string | null
  brand?: string | null
  is_new_arrival?: boolean
  is_coming_soon?: boolean
  experience_story?: string | null
  return_window_days?: number
  is_returnable?: boolean
  variants: {
    id?: string
    sku: string
    size?: string
    color?: string
    price_override?: number | null
    stock_quantity: number
  }[]
  images: {
    id?: string
    url: string
    sort_order: number
  }[]
  model_url?: string | null
}

export async function upsertProduct(payload: ProductPayload) {
  const { supabase, storeId } = await getSellerStore()

  // 1. Upsert Product
  const productData = {
    store_id: storeId,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    compare_at_price: payload.compare_at_price,
    status: payload.status,
    category_id: payload.category_id || null,
    brand: payload.brand || null,
    model_url: payload.model_url || null,
    is_new_arrival: payload.is_new_arrival ?? false,
    is_coming_soon: payload.is_coming_soon ?? false,
    experience_story: payload.experience_story || null,
    return_window_days: payload.return_window_days ?? 7,
    is_returnable: payload.is_returnable ?? true,
    approval_status: 'approved',
    updated_at: new Date().toISOString()
  }

  let productId = payload.id

  if (productId) {
    const { error } = await supabase.from('products').update(productData).eq('id', productId).eq('store_id', storeId)
    if (error) throw new Error(error.message)
  } else {
    // Generate an AI experience story if missing
    if (!productData.experience_story) {
      try {
        const { text } = await generateText({
          model: google('gemini-1.5-flash'),
          prompt: `Write a short, attractive "Experience Story" (2-3 sentences) explaining the real-life experience of using this product: "${payload.title}". Emphasize how it feels, its premium nature, and its benefits. Do not use generic AI intro phrases.`,
        })
        productData.experience_story = text.trim()
      } catch (err) {
        console.error('Failed to generate experience story:', err)
      }
    }

    const { data, error } = await supabase.from('products').insert(productData).select('id').single()
    if (error) throw new Error(error.message)
    productId = data.id
  }

  if (!productId) throw new Error('Failed to obtain product ID')

  // 2. Variants (For simplicity in this MVP, we delete existing and re-insert, or upsert by ID)
  // To safely handle removals, we first delete all variants NOT in the incoming payload (if they have IDs)
  const incomingVariantIds = payload.variants.map(v => v.id).filter(Boolean) as string[]
  if (incomingVariantIds.length > 0) {
    await supabase.from('product_variants').delete().eq('product_id', productId).not('id', 'in', `(${incomingVariantIds.join(',')})`)
  } else {
    await supabase.from('product_variants').delete().eq('product_id', productId)
  }

  for (const variant of payload.variants) {
    if (variant.id) {
      await supabase.from('product_variants').update({
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price_override: variant.price_override,
        stock_quantity: variant.stock_quantity
      }).eq('id', variant.id).eq('product_id', productId)
    } else {
      await supabase.from('product_variants').insert({
        product_id: productId,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price_override: variant.price_override,
        stock_quantity: variant.stock_quantity
      })
    }
  }

  // 3. Images (Same pattern)
  const incomingImageIds = payload.images.map(i => i.id).filter(Boolean) as string[]
  if (incomingImageIds.length > 0) {
    await supabase.from('product_images').delete().eq('product_id', productId).not('id', 'in', `(${incomingImageIds.join(',')})`)
  } else {
    await supabase.from('product_images').delete().eq('product_id', productId)
  }

  for (const img of payload.images) {
    if (img.id) {
      await supabase.from('product_images').update({ sort_order: img.sort_order }).eq('id', img.id).eq('product_id', productId)
    } else {
      await supabase.from('product_images').insert({ product_id: productId, url: img.url, sort_order: img.sort_order })
    }
  }

  // 4. Generate AI Embeddings
  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: `Title: ${payload.title}\nDescription: ${payload.description}\nCategory ID: ${payload.category_id || 'None'}`,
    })
    
    // Convert array to pgvector string format: '[0.1, 0.2, ...]'
    const embeddingString = `[${embedding.join(',')}]`
    
    // Update the embedding column
    await supabase.from('products').update({ embedding: embeddingString }).eq('id', productId)
  } catch (err) {
    console.error('Failed to generate embedding for product', productId, err)
  }

  revalidatePath('/seller/products')
  revalidatePath('/new-arrivals')
  return productId
}

export async function deleteProducts(productIds: string[]) {
  const { supabase, storeId } = await getSellerStore()
  // RLS and store_id filter protect against deleting other sellers' products
  const { error } = await supabase.from('products').delete().eq('store_id', storeId).in('id', productIds)
  if (error) throw new Error(error.message)
  revalidatePath('/seller/products')
}

export async function updateProductStatuses(productIds: string[], status: 'draft' | 'active' | 'archived') {
  const { supabase, storeId } = await getSellerStore()
  const { error } = await supabase.from('products').update({ status }).eq('store_id', storeId).in('id', productIds)
  if (error) throw new Error(error.message)
  revalidatePath('/seller/products')
}

export async function getPriceBounds(params: { category?: string, brand?: string, q?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('price, categories!inner(slug)')
    .eq('status', 'active')

  if (params.category) {
    const cats = params.category.split(',').filter(Boolean)
    if (cats.length > 0) query = query.in('categories.slug', cats)
  }
  
  if (params.brand) {
    const brands = params.brand.split(',').filter(Boolean)
    if (brands.length > 0) query = query.in('brand', brands)
  }

  if (params.q) {
    const { data: searchResults } = await supabase.rpc('search_products_fuzzy', { search_term: params.q })
    if (searchResults && searchResults.length > 0) {
      query = query.in('id', searchResults.map((r: any) => r.id))
    } else if (searchResults && searchResults.length === 0) {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000') 
    }
  }

  const { data, error } = await query
  if (error || !data || data.length === 0) {
    return { min: 0, max: 1000 }
  }

  const prices = data.map(p => p.price)
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices))
  }
}
