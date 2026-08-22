'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2, ArrowRight, Tag, Layers, ShoppingBag, X, HelpCircle, Package, Store, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, Variants } from 'framer-motion'
import { getGlobalSuggestions, getSearchCorrection, recordSearchQuery } from '@/app/actions/search'

// Utility to highlight matching text
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) => regex.test(part) ? <span key={i} className="font-bold text-accent-primary">{part}</span> : <span key={i}>{part}</span>)}
    </span>
  )
}

export function CommandBarInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [didYouMean, setDidYouMean] = useState<string | null>(null)
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mouse Parallax Glow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  // Animation States
  const isTyping = isFocused && query.length > 0
  const isProcessing = isSearching
  
  const spinDuration = isProcessing ? '1s' : isTyping ? '2s' : '4s'
  const glowOpacity = isProcessing ? 1 : isTyping ? 0.8 : isFocused ? 0.5 : isHovered ? 0.2 : 0

  // Slice to limit results and prevent massive dropdowns
  const displayCategories = categories.slice(0, 2)
  const displayBrands = brands.slice(0, 2)
  const displayProducts = products.slice(0, 4)

  const flatSuggestions = [
    ...displayCategories.map(c => ({ type: 'category', data: c, href: `/categories/${c.slug}` })),
    ...displayBrands.map(b => ({ type: 'brand', data: b, href: `/products?brand=${encodeURIComponent(b)}` })),
    ...displayProducts.map(p => ({ type: 'product', data: p, href: `/products/${p.id}` }))
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const q = searchParams?.get('q')
    if (q && !isFocused) {
      setQuery(q)
    } else if (!q && pathname === '/products' && !isFocused) {
      setQuery('')
    }
  }, [searchParams, pathname]) // We intentionally omit isFocused to prevent constant resetting while typing

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setProducts([])
      setCategories([])
      setBrands([])
      setDidYouMean(null)
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await getGlobalSuggestions(query.trim())
        setProducts(results.products || [])
        setCategories(results.categories || [])
        setBrands(results.brands || [])
        setSelectedIndex(-1)
        
        const isEmpty = !results.products?.length && !results.categories?.length && !results.brands?.length
        if (isEmpty && query.trim().length >= 3) {
          const correction = await getSearchCorrection(query.trim())
          setDidYouMean(correction)
        } else {
          setDidYouMean(null)
        }
        setShowDropdown(true)
      } catch (e) {
        console.error(e)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < flatSuggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowDropdown(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
        setShowDropdown(false)
        router.push(flatSuggestions[selectedIndex].href)
        setQuery('')
      } else if (didYouMean) {
        setQuery(didYouMean)
        inputRef.current?.focus()
      } else {
        handleSearch()
      }
    }
  }

  const handleSearch = () => {
    if (!query.trim()) return
    setShowDropdown(false)
    inputRef.current?.blur()
    // Fire-and-forget: record this search term for global popularity tracking
    recordSearchQuery(query.trim()).catch(() => {})
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  // Animation variants for staggered list
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50" ref={dropdownRef}>
      <motion.form 
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="relative group rounded-full z-10"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? '0 20px 40px -10px rgba(var(--accent-primary-rgb, 99, 102, 241), 0.25)' : '0 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Layer 2: Mouse Parallax Glow */}
        <motion.div
          className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                200px circle at ${mouseX}px ${mouseY}px,
                rgba(var(--accent-primary-rgb, 99, 102, 241), 0.15),
                transparent 80%
              )
            `,
          }}
        />

        {/* Layer 3: Dynamic Conic Gradient Border */}
        <div 
          className="absolute -inset-[1.5px] rounded-full overflow-hidden transition-opacity duration-500 pointer-events-none"
          style={{ opacity: glowOpacity }}
        >
          <div 
            className="absolute inset-[-100%] animate-spin" 
            style={{ 
              animationDuration: spinDuration,
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 40%, var(--color-accent-primary, #4f46e5) 80%, transparent 100%)' 
            }} 
          />
        </div>
        
        {/* Layer 4: Inner Search Box */}
        <div className={`relative flex items-center rounded-full overflow-hidden transition-colors duration-500 border ${
          isFocused ? 'bg-card border-transparent' : 'bg-muted/80 border-border/50 group-hover:border-border'
        }`}>
          {/* Inner Shadow Glow when Typing */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-full ${isTyping ? 'opacity-100' : 'opacity-0'}`}
               style={{ boxShadow: 'inset 0 0 15px rgba(var(--accent-primary-rgb, 99, 102, 241), 0.1)' }} 
          />

          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 gap-1.5">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
            ) : (
              <motion.div
                animate={{ 
                  rotate: isFocused ? 10 : 0, 
                  scale: isFocused ? 1.1 : 1,
                  color: isFocused ? 'var(--color-accent-primary, #4f46e5)' : '#94a3b8' 
                }}
                transition={{ duration: 0.3 }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
            )}
            <AnimatePresence>
              {isTyping && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Sparkles className="w-4 h-4 text-accent-primary/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              if (query.length >= 2) setShowDropdown(true)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent border-none relative z-10
              rounded-full pl-[4.5rem] pr-12 py-3.5 text-[15px] font-medium transition-all duration-300
              placeholder:text-muted-foreground focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${isFocused ? 'text-foreground' : 'text-foreground/80'}`}
            placeholder="Search for products, brands, or categories..."
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                  
                  if (pathname === '/products') {
                    const params = new URLSearchParams(Array.from(searchParams?.entries() || []))
                    params.delete('q')
                    const search = params.toString()
                    router.push(search ? `/products?${search}` : '/products')
                  }
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
              >
                <div className="bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full p-1.5 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.form>

      {/* Suggestions Dropdown - Centered & Compact */}
      <AnimatePresence>
        {showDropdown && (products.length > 0 || categories.length > 0 || brands.length > 0 || didYouMean || query.length >= 2) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[calc(100%-1rem)] max-w-[520px] bg-background/95 backdrop-blur-xl rounded-[1.25rem] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-border/50 overflow-hidden z-40"
          >
            <ScrollArea className="max-h-[420px]">
              
              {didYouMean && flatSuggestions.length === 0 && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-accent-primary/5 border-b border-border/50">
                   <button
                     onClick={() => { setQuery(didYouMean); inputRef.current?.focus() }}
                     className="flex items-center gap-2.5 text-sm text-foreground/80 hover:text-accent-primary transition-colors group w-full text-left"
                   >
                     <HelpCircle className="w-4 h-4 text-accent-primary group-hover:scale-110 transition-transform" />
                     <span>Did you mean: <span className="font-bold text-accent-primary group-hover:underline">{didYouMean}</span>?</span>
                   </button>
                </motion.div>
              )}

              {flatSuggestions.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="py-2 flex flex-col">
                  
                  {/* Categories */}
                  {displayCategories.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-1">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3 h-3" /> Categories
                      </div>
                      {displayCategories.map((cat, i) => {
                        const globalIndex = flatSuggestions.findIndex(s => s.data === cat && s.type === 'category')
                        const isSelected = selectedIndex === globalIndex
                        return (
                          <Link 
                            key={cat.slug} href={`/categories/${cat.slug}`}
                            onClick={() => setShowDropdown(false)} onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex items-center px-4 py-2 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50 dark:bg-muted/30' : 'hover:bg-muted/30'}`}
                          >
                            <Package className="w-3.5 h-3.5 mr-2.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground/90"><HighlightMatch text={cat.name} query={query} /></span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}

                  {/* Brands */}
                  {displayBrands.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-1">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> Brands
                      </div>
                      {displayBrands.map((brand, i) => {
                        const globalIndex = flatSuggestions.findIndex(s => s.data === brand && s.type === 'brand')
                        const isSelected = selectedIndex === globalIndex
                        return (
                          <Link 
                            key={brand} href={`/products?brand=${encodeURIComponent(brand)}`}
                            onClick={() => setShowDropdown(false)} onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex items-center px-4 py-2 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50 dark:bg-muted/30' : 'hover:bg-muted/30'}`}
                          >
                            <Store className="w-3.5 h-3.5 mr-2.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground/90"><HighlightMatch text={brand} query={query} /></span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}

                  {/* Products */}
                  {displayProducts.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-2">
                      <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" /> Products
                      </div>
                      {displayProducts.map((item, i) => {
                        const globalIndex = flatSuggestions.findIndex(s => s.data === item && s.type === 'product')
                        const isSelected = selectedIndex === globalIndex
                        const imageUrl = item.product_images?.[0]?.url
                        return (
                          <Link 
                            key={item.id} href={`/products/${item.id}`}
                            onClick={() => setShowDropdown(false)} onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex items-center gap-3 px-4 py-2 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50 dark:bg-muted/30' : 'hover:bg-muted/30'}`}
                          >
                            <div className="w-10 h-10 relative rounded-[0.4rem] overflow-hidden bg-muted flex-shrink-0 border border-border/50 shadow-sm">
                              {imageUrl ? (
                                <Image src={imageUrl} alt={item.title} fill className="object-cover" />
                              ) : (
                                <ShoppingBag className="w-4 h-4 m-auto text-muted-foreground/50 absolute inset-0" />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-medium truncate text-foreground/90"><HighlightMatch text={item.title} query={query} /></span>
                              {item.brand && <span className="text-[11px] text-muted-foreground truncate">{item.brand}</span>}
                            </div>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                  
                  {/* Global Search Action */}
                  <motion.div variants={itemVariants} className="border-t border-border/50 p-2 mt-1 bg-muted/10">
                    <button 
                      onClick={handleSearch}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-[0.6rem] text-sm font-medium bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all group"
                    >
                      <span>View all results for "{query}"</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>

                </motion.div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  {isSearching ? (
                    <div className="relative">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-accent-primary blur-xl rounded-full" />
                      <Loader2 className="w-6 h-6 text-accent-primary animate-spin mb-3 relative z-10" />
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 border border-border">
                        <Search className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Try another search or browse categories</p>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CommandBar() {
  return (
    <Suspense fallback={<div className="relative w-full max-w-2xl mx-auto h-[52px]" />}>
      <CommandBarInner />
    </Suspense>
  )
}
