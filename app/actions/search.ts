'use server'

import { createClient } from '@/lib/supabase/server'

// Simple Levenshtein distance algorithm
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[a.length][b.length]
}

export async function getGlobalSuggestions(query: string) {
  if (!query || query.length < 2) return { products: [], categories: [], brands: [] }
  
  const supabase = await createClient()
  
  // 1. Fuzzy Search Products
  const { data: searchResults } = await supabase.rpc('search_products_fuzzy', { search_term: query })
  let products: any[] = []
  if (searchResults && searchResults.length > 0) {
    const topIds = searchResults.slice(0, 4).map((r: any) => r.id)
    const { data: pData } = await supabase
      .from('products')
      .select('id, title, brand, product_images(url)')
      .in('id', topIds)
    products = pData || []
  }

  // 2. Search Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .ilike('name', `%${query}%`)
    .limit(3)

  // 3. Search Brands (Unique brands from active products)
  const { data: brandsData } = await supabase
    .from('products')
    .select('brand')
    .ilike('brand', `%${query}%`)
    .eq('status', 'active')
    .not('brand', 'is', null)

  const brands = Array.from(new Set(brandsData?.map(b => b.brand))).slice(0, 3)

  return { products, categories: categories || [], brands }
}

/**
 * Records a search term globally.
 * Upserts into search_queries: increments count if term exists, else inserts.
 * Silently fails if the table doesn't exist yet.
 */
export async function recordSearchQuery(term: string) {
  if (!term || term.trim().length < 2) return
  const normalized = term.trim().toLowerCase()

  try {
    const supabase = await createClient()
    // Try to insert; if duplicate, increment count
    const { error } = await supabase.rpc('upsert_search_query', { p_term: normalized })
    if (error) {
      // Fallback: manual upsert if RPC doesn't exist yet
      const { data: existing } = await supabase
        .from('search_queries')
        .select('id, count')
        .eq('term', normalized)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('search_queries')
          .update({ count: existing.count + 1, last_searched_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('search_queries')
          .insert({ term: normalized, count: 1 })
      }
    }
  } catch {
    // Silently fail — tracking is non-critical
  }
}

/**
 * Returns global popular search terms ordered by count DESC.
 * Falls back to empty array if the table doesn't exist yet.
 */
export async function getPopularSearchTerms(limit = 15): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('search_queries')
      .select('term')
      .order('count', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) return []
    return data.map(r => r.term)
  } catch {
    return []
  }
}

export async function getSearchCorrection(query: string) {
  if (!query || query.length < 3) return null

  const supabase = await createClient()

  // Fetch a dictionary of possible correct words:
  // We'll use Categories and Brands since they are highly relevant
  const { data: categories } = await supabase.from('categories').select('name')
  const { data: products } = await supabase.from('products').select('brand, title').eq('status', 'active')

  const dictionary = new Set<string>()
  categories?.forEach(c => dictionary.add(c.name.toLowerCase()))
  products?.forEach(p => {
    if (p.brand) dictionary.add(p.brand.toLowerCase())
    // Add words from title
    p.title.split(' ').forEach((word: string) => {
      if (word.length > 3) dictionary.add(word.toLowerCase())
    })
  })

  let bestMatch = null
  let lowestDistance = Infinity
  const q = query.toLowerCase()

  for (const word of dictionary) {
    const distance = levenshtein(q, word)
    // distance === 0 means exact case-insensitive match — not a "correction", skip it
    if (distance > 0 && distance < lowestDistance && distance <= 2) {
      lowestDistance = distance
      bestMatch = word
    }
  }

  return bestMatch
}
