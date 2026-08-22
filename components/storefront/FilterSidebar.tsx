'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

export function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([])
  const [brands, setBrands] = useState<string[]>([])

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '500')

  useEffect(() => {
    async function fetchFilters() {
      const supabase = createClient()
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      if (cats) setCategories(cats)

      const { data: prods } = await supabase.from('products').select('brand').eq('status', 'active').not('brand', 'is', null)
      if (prods) {
        const uniqueBrands = Array.from(new Set(prods.map(p => p.brand).filter(Boolean))) as string[]
        setBrands(uniqueBrands.sort())
      }
    }
    fetchFilters()
  }, [])

  // Sync state if URL changes outside
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '')
    setSelectedBrand(searchParams.get('brand') || '')
    setMaxPrice(searchParams.get('max_price') || '500')
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategory) params.set('category', selectedCategory)
    else params.delete('category')
    
    if (selectedBrand) params.set('brand', selectedBrand)
    else params.delete('brand')

    if (maxPrice && maxPrice !== '500') params.set('max_price', maxPrice)
    else params.delete('max_price')

    // Always push to /products so filters work globally even if on home page
    const targetPath = pathname === '/' ? '/products' : pathname
    router.push(`${targetPath}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('brand')
    params.delete('max_price')
    setSelectedCategory('')
    setSelectedBrand('')
    setMaxPrice('500')
    const targetPath = pathname === '/' ? '/products' : pathname
    router.push(`${targetPath}?${params.toString()}`)
  }

  return (
    <div className="space-y-8 bg-surface-base p-6 rounded-xl border sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-xl">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground text-xs h-8">Clear all</Button>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Category</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
          {categories.map(c => (
            <div key={c.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${c.slug}`} 
                checked={selectedCategory === c.slug}
                onCheckedChange={(checked) => {
                  setSelectedCategory(checked ? c.slug : '')
                  // Auto-apply on change
                  setTimeout(applyFilters, 50)
                }}
              />
              <Label htmlFor={`cat-${c.slug}`} className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {c.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-sm">Brand</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
          {brands.map(b => (
            <div key={b} className="flex items-center space-x-2">
              <Checkbox 
                id={`brand-${b}`} 
                checked={selectedBrand === b}
                onCheckedChange={(checked) => {
                  setSelectedBrand(checked ? b : '')
                  setTimeout(applyFilters, 50)
                }}
              />
              <Label htmlFor={`brand-${b}`} className="text-sm font-normal cursor-pointer leading-none">
                {b}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-sm">Max Price</h4>
          <span className="text-xs text-muted-foreground">₹{maxPrice}</span>
        </div>
        <Slider 
          value={[parseInt(maxPrice)]} 
          min={0} 
          max={1500} 
          step={50} 
          onValueChange={(val: any) => setMaxPrice(val[0].toString())}
          onValueCommitted={() => applyFilters()}
        />
      </div>

    </div>
  )
}
