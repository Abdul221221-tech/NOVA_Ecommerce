import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPopularSearchTerms } from '@/app/actions/search'
import { Search } from 'lucide-react'

// Minimum number of tracked search queries before we switch from fallback to real data
const MIN_REAL_DATA = 5

export async function SearchChips() {
  const supabase = await createClient()

  // 1. Try to get real global popularity data first
  const popularTerms = await getPopularSearchTerms(15)

  let terms: string[] = []

  if (popularTerms.length >= MIN_REAL_DATA) {
    // Enough real data — show most searched terms globally
    terms = popularTerms
  } else {
    // Fallback: curated mix from DB categories + brands
    const [{ data: categories }, { data: brands }, { data: products }] = await Promise.all([
      supabase.from('categories').select('name').limit(5),
      supabase.from('products').select('brand').eq('status', 'active').not('brand', 'is', null).limit(20),
      supabase.from('products').select('title').eq('status', 'active').limit(20),
    ])

    const uniqueBrands = Array.from(new Set(brands?.map(b => b.brand).filter(Boolean))) as string[]
    const shortTitles = (products?.map(p => p.title).filter(t => t.length < 25) || []).slice(0, 5)
    const categoryNames = categories?.map(c => c.name) || []

    // Prepend any existing real terms so they appear first
    const combined = [...popularTerms, ...categoryNames, ...uniqueBrands, ...shortTitles]

    // Deduplicate case-insensitively
    const seen = new Set<string>()
    for (const t of combined) {
      const key = t.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        terms.push(t)
      }
      if (terms.length >= 15) break
    }
  }

  if (terms.length === 0) return null

  return (
    <div className="border-t bg-surface-base/50">
      <div className="container mx-auto px-4 max-w-[1600px] py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground shrink-0 font-medium text-sm uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Popular Searches</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {terms.map((term, i) => (
            <Link 
              key={`${term}-${i}`}
              href={`/products?q=${encodeURIComponent(term)}`}
              className="px-4 py-1.5 bg-background border rounded-full text-sm hover:border-accent-primary hover:text-accent-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary whitespace-nowrap capitalize"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
