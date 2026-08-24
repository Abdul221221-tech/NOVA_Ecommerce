'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPriceBounds } from '@/app/actions/product'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings2, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

export function ShopFilterDrawer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([])
  const [brands, setBrands] = useState<string[]>([])

  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('category')?.split(',').filter(Boolean) || [])
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get('brand')?.split(',').filter(Boolean) || [])
  
  // Price States
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 100])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [isBoundsLoaded, setIsBoundsLoaded] = useState(false)
  
  const [isOpen, setIsOpen] = useState(false)

  // Active filter count
  const activeCount = [
    selectedCategories.length > 0 ? 1 : 0,
    selectedBrands.length > 0 ? 1 : 0,
    (searchParams.get('min_price') || searchParams.get('max_price')) ? 1 : 0
  ].reduce((a, b) => a + b, 0)

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

  useEffect(() => {
    async function fetchBounds() {
      const q = searchParams.get('q') || undefined
      const bounds = await getPriceBounds({ 
        category: selectedCategories.join(','), 
        brand: selectedBrands.join(','), 
        q 
      })
      
      const minBound = bounds.min
      // Ensure max is strictly greater than min for the slider to work properly
      const maxBound = Math.max(bounds.min + 1, bounds.max)
      
      setPriceBounds([minBound, maxBound])
      setIsBoundsLoaded(true)
      
      // If there are search params for price, respect them, otherwise use the new bounds
      const urlMin = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : minBound
      const urlMax = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : maxBound

      setPriceRange([
        Math.max(minBound, Math.min(urlMin, maxBound)),
        Math.max(minBound, Math.min(urlMax, maxBound))
      ])
    }
    fetchBounds()
  }, [selectedCategories, selectedBrands, searchParams.get('q')]) // Trigger when selections change or query changes

  // Update selection state when the drawer opens or URL params change externally
  useEffect(() => {
    if (isOpen) {
      setSelectedCategories(searchParams.get('category')?.split(',').filter(Boolean) || [])
      setSelectedBrands(searchParams.get('brand')?.split(',').filter(Boolean) || [])
      if (isBoundsLoaded) {
        setPriceRange([
          searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : priceBounds[0],
          searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : priceBounds[1]
        ])
      }
    }
  }, [searchParams, isOpen, isBoundsLoaded])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
    else params.delete('category')
    
    if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))
    else params.delete('brand')

    if (priceRange[0] > priceBounds[0]) params.set('min_price', priceRange[0].toString())
    else params.delete('min_price')

    if (priceRange[1] < priceBounds[1]) params.set('max_price', priceRange[1].toString())
    else params.delete('max_price')

    const targetPath = pathname === '/' ? '/products' : pathname
    router.push(`${targetPath}?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([priceBounds[0], priceBounds[1]])
    const targetPath = pathname === '/' ? '/products' : pathname
    router.push(targetPath)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary">
        <Settings2 className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 bg-accent-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 border-l">
        <SheetHeader className="p-6 border-b text-left">
          <SheetTitle className="text-2xl font-heading flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-accent-primary" />
            Filters
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-8 pb-12">
            
            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Categories</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cat-all" 
                    checked={selectedCategories.length === 0} 
                    onCheckedChange={() => setSelectedCategories([])}
                  />
                  <Label htmlFor="cat-all" className="cursor-pointer font-normal text-muted-foreground">All Categories</Label>
                </div>
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${cat.id}`} 
                      checked={selectedCategories.includes(cat.slug)} 
                      onCheckedChange={() => {
                        setSelectedCategories(prev => 
                          prev.includes(cat.slug) ? prev.filter(c => c !== cat.slug) : [...prev, cat.slug]
                        )
                      }}
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal text-foreground/80">{cat.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Brands</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="brand-all" 
                      checked={selectedBrands.length === 0} 
                      onCheckedChange={() => setSelectedBrands([])}
                    />
                    <Label htmlFor="brand-all" className="cursor-pointer font-normal text-muted-foreground">All Brands</Label>
                  </div>
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brand-${brand}`} 
                        checked={selectedBrands.includes(brand)} 
                        onCheckedChange={() => {
                          setSelectedBrands(prev => 
                            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                          )
                        }}
                      />
                      <Label htmlFor={`brand-${brand}`} className="cursor-pointer font-normal text-foreground/80">{brand}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Price Range</h3>
                <span className="text-sm font-medium text-accent-primary">₹{priceRange[0]} – ₹{priceRange[1]}</span>
              </div>
              <Slider
                value={priceRange}
                min={priceBounds[0]}
                max={priceBounds[1]}
                step={Math.max(1, Math.floor((priceBounds[1] - priceBounds[0]) / 100))}
                onValueChange={(vals) => setPriceRange(vals as [number, number])}
                className="py-4 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{priceBounds[0]}</span>
                <span>₹{priceBounds[1]}</span>
              </div>
            </div>

          </div>
        </div>
        
        <SheetFooter className="p-6 border-t bg-background mt-auto flex flex-row gap-3 sm:justify-between items-center w-full">
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            Clear All
          </Button>
          <Button onClick={applyFilters} className="bg-accent-primary hover:bg-accent-primary/90 text-background rounded-full px-8">
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
