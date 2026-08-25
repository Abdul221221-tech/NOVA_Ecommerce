'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CommandBar } from '@/components/storefront/CommandBar'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ShoppingCart, Menu, User, ChevronDown, LogOut, LayoutDashboard, Store, Package, Heart, Settings, ArrowRight, Search } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { logout } from '@/app/actions/auth'
import { Checkbox } from '@/components/ui/checkbox'
import { NotificationDropdown } from './NotificationDropdown'
import { NotificationData } from '@/app/actions/notifications'

export function Header({ 
  user, 
  profile, 
  role, 
  categories, 
  brands,
  initialNotifications = [],
  initialUnreadCount = 0
}: { 
  user: any, 
  profile?: any, 
  role: string | null, 
  categories: any[], 
  brands: string[],
  initialNotifications?: NotificationData[],
  initialUnreadCount?: number
}) {
  const { cartItems, wishlistItems, clearUserLocalData } = useStorefront()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [brandSearch, setBrandSearch] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedBrnds, setSelectedBrnds] = useState<string[]>([])
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [isBrndOpen, setIsBrndOpen] = useState(false)
  
  const [megaMenuQuery, setMegaMenuQuery] = useState('')
  
  const [isPending, startTransition] = useTransition()

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Instant UI update
    clearUserLocalData()
    toast.success('Logged out successfully.')
    
    // Server state update and redirect
    startTransition(async () => {
      await logout()
    })
  }

  useEffect(() => {
    const cats = searchParams.get('category')?.split(',').filter(Boolean) || []
    setSelectedCats(cats)
    const brnds = searchParams.get('brand')?.split(',').filter(Boolean) || []
    setSelectedBrnds(brnds)
  }, [searchParams])

  const toggleCategory = (slug: string) => {
    setSelectedCats(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug])
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrnds(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
  }

  const applyNavigation = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedCats.length > 0) params.set('category', selectedCats.join(','))
    else params.delete('category')
    
    if (selectedBrnds.length > 0) params.set('brand', selectedBrnds.join(','))
    else params.delete('brand')

    router.push(`/products?${params.toString()}`)
    setIsCatOpen(false)
    setIsBrndOpen(false)
  }

  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  // Navigation Interaction States
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [activeMegaMenu, setActiveMegaMenu] = useState<'categories' | 'brands' | null>(null)
  
  // Keep dropdowns open if hovering over the mega menu content
  const handleNavLeave = () => {
    setHoveredNav(null)
    setActiveMegaMenu(null)
    setMegaMenuQuery('')
  }

  const sellerCentreLink = !user ? '/seller/login' : (role === 'seller' ? '/seller' : '/seller/signup')
  
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
  ]

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 flex flex-col items-center ${isScrolled ? 'pt-2 pb-2' : 'pt-0 pb-0'}`}
    >
      <div className={`w-[calc(100%-2rem)] max-w-[1600px] mx-auto transition-all duration-500 ${isScrolled ? 'rounded-[2rem] border border-foreground/10 bg-background/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[72px] px-2 sm:px-4 md:px-8' : 'w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 h-24 px-4 md:px-10'}`}>
        <div className="flex items-center gap-1 sm:gap-4 md:gap-8 justify-between h-full">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Sheet>
              <SheetTrigger className="md:hidden p-2 rounded-full hover:bg-muted transition-colors focus:outline-none hover:scale-105 active:scale-95">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r-0 bg-background/95 backdrop-blur-2xl">
                <SheetHeader>
                  <SheetTitle className="font-heading text-2xl text-left text-accent-primary tracking-tight">NOVA</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-10 h-[calc(100vh-100px)] overflow-y-auto pb-24 custom-scrollbar">
                  {navLinks.map((link, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={link.name}
                    >
                      <Link href={link.href} className={`block px-4 py-3 rounded-2xl text-lg font-medium transition-colors ${pathname === link.href ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-muted text-foreground/80'}`}>
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Categories Section */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="pt-6 mt-4 border-t">
                    <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
                    <div className={`flex flex-col gap-1 ${showAllCategories ? 'max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                      {(showAllCategories ? categories : categories.slice(0, 6)).map(cat => (
                        <Link key={cat.slug} href={`/categories/${cat.slug}`} className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>
                          {cat.name}
                        </Link>
                      ))}
                      {categories.length > 6 && (
                        <button 
                          onClick={() => setShowAllCategories(!showAllCategories)}
                          className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-accent-primary hover:bg-accent-primary/10 transition-colors flex items-center gap-2"
                        >
                          {showAllCategories ? 'Show Less' : `View All (${categories.length})`}
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Brands Section */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="pt-6 mt-4 border-t">
                    <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Brands</p>
                    
                    <AnimatePresence>
                      {showAllBrands && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 mb-3 overflow-hidden"
                        >
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                              type="text" 
                              placeholder="Search brands..." 
                              value={brandSearch}
                              onChange={(e) => setBrandSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`flex flex-col gap-1 ${showAllBrands ? 'max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                      {(showAllBrands ? brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase())) : brands.slice(0, 6)).map(brand => (
                        <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`} className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>
                          {brand}
                        </Link>
                      ))}
                      
                      {brands.length > 6 && (
                        <button 
                          onClick={() => {
                            if (showAllBrands) setBrandSearch('');
                            setShowAllBrands(!showAllBrands);
                          }}
                          className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-accent-primary hover:bg-accent-primary/10 transition-colors flex items-center gap-2 mt-1"
                        >
                          {showAllBrands ? 'Show Less' : `View All (${brands.length})`}
                        </button>
                      )}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="pt-6 mt-4 border-t mb-12">
                    <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">My Account</p>
                    <div className="flex flex-col gap-1">
                      {user ? (
                        <>
                          <Link href="/account" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>My Profile</Link>
                          <Link href="/account/orders" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>Orders</Link>
                          <Link href="/wishlist" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>Wishlist</Link>
                          <Link href="/account/settings" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors" onClick={() => setIsMobileSearchOpen(false)}>Settings</Link>
                          {(role === 'seller' || role === 'platform_admin') && (
                            <Link href={role === 'seller' ? '/seller' : '/platform-admin'} className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors">Dashboard</Link>
                          )}
                          <form action={logout}>
                            <button type="submit" className="w-full text-left px-4 py-2.5 rounded-xl text-base text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">Log out</button>
                          </form>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors">Sign In</Link>
                          <Link href="/signup" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors">Sign Up</Link>
                          <Link href="/seller/login" className="px-4 py-2.5 rounded-xl text-base text-foreground/80 hover:bg-muted hover:text-accent-primary transition-colors">Seller Centre</Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 focus:outline-none group shrink-0 relative px-2 py-1 -ml-2 rounded-xl">
              <motion.div 
                className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 overflow-hidden rounded-full shadow-[0_0_0_rgba(217,70,239,0)] group-hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] border border-foreground/10 transition-shadow duration-500 z-10 shrink-0"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Image src="/logo.jpg" alt="NOVA Logo" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
              </motion.div>
              <div className="relative z-10 overflow-visible pr-2">
                <span 
                  className="font-heading text-xl sm:text-2xl md:text-3xl font-black tracking-tighter inline-block relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-orange-400 group-hover:translate-x-1 transition-all duration-500 ease-out"
                >
                  NOVA
                </span>
              </div>
            </Link>
            
            {/* Desktop Primary Nav (Premium Pill Design) */}
            <nav className="hidden lg:flex items-center gap-2 ml-6 h-full relative" onMouseLeave={handleNavLeave}>
              {navLinks.map(link => {
                const isActive = pathname === link.href;
                const isHovered = hoveredNav === link.name;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="relative px-4 py-2 h-auto flex items-center justify-center rounded-full group focus:outline-none"
                    onMouseEnter={() => { setHoveredNav(link.name); setActiveMegaMenu(null); }}
                  >
                    <span className={`relative z-10 text-sm font-semibold transition-colors duration-300 ${isActive || isHovered ? 'text-foreground' : 'text-foreground/80'}`}>
                      {link.name}
                    </span>
                    {(isHovered || (isActive && hoveredNav === null)) && (
                      <motion.div layoutId="nav-pill" className="absolute inset-0 bg-foreground/10 backdrop-blur-md rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-foreground/10" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                    )}
                  </Link>
                )
              })}

              {/* Categories Trigger */}
              <div 
                className="relative px-4 py-2 h-auto cursor-pointer flex items-center gap-1.5 rounded-full group focus:outline-none"
                onMouseEnter={() => { setHoveredNav('Categories'); setActiveMegaMenu('categories'); }}
              >
                <span className={`relative z-10 text-sm font-semibold transition-colors duration-300 ${(hoveredNav === 'Categories' || (pathname.includes('category=') && hoveredNav === null)) ? 'text-foreground' : 'text-foreground/80'}`}>
                  Categories
                </span>
                <motion.div animate={{ rotate: activeMegaMenu === 'categories' ? -180 : 0 }} transition={{ duration: 0.3 }} className={`relative z-10 transition-colors ${hoveredNav === 'Categories' ? 'text-foreground' : 'text-foreground/80'}`}>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </motion.div>
                {(hoveredNav === 'Categories' || (pathname.includes('category=') && hoveredNav === null)) && (
                  <motion.div layoutId="nav-pill" className="absolute inset-0 bg-foreground/10 backdrop-blur-md rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-foreground/10" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
              </div>

              {/* Brands Trigger */}
              {brands.length > 0 && (
                <div 
                  className="relative px-4 py-2 h-auto cursor-pointer flex items-center gap-1.5 rounded-full group focus:outline-none"
                  onMouseEnter={() => { setHoveredNav('Brands'); setActiveMegaMenu('brands'); }}
                >
                  <span className={`relative z-10 text-sm font-semibold transition-colors duration-300 ${(hoveredNav === 'Brands' || (pathname.includes('brand=') && hoveredNav === null)) ? 'text-foreground' : 'text-foreground/80'}`}>
                    Brands
                  </span>
                  <motion.div animate={{ rotate: activeMegaMenu === 'brands' ? -180 : 0 }} transition={{ duration: 0.3 }} className={`relative z-10 transition-colors ${hoveredNav === 'Brands' ? 'text-foreground' : 'text-foreground/80'}`}>
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </motion.div>
                  {(hoveredNav === 'Brands' || (pathname.includes('brand=') && hoveredNav === null)) && (
                    <motion.div layoutId="nav-pill" className="absolute inset-0 bg-foreground/10 backdrop-blur-md rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-foreground/10" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                  )}
                </div>
              )}

              {/* Custom Mega Menu Overlay */}
              <AnimatePresence>
                {activeMegaMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-full mt-4 left-0 w-[calc(100vw-2rem)] sm:w-[460px] bg-background backdrop-blur-2xl border border-foreground/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-[1.5rem] overflow-hidden flex flex-col z-50 origin-top-left"
                    onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
                  >
                    <div className="p-5 px-6 bg-gradient-to-b from-white/5 to-transparent border-b border-foreground/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-heading font-bold text-foreground">
                          {activeMegaMenu === 'categories' ? 'Shop by Category' : 'Shop by Brand'}
                        </h3>
                      </div>
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/" />
                        <input
                          type="text"
                          autoFocus
                          value={megaMenuQuery}
                          onChange={(e) => setMegaMenuQuery(e.target.value)}
                          placeholder={`Search ${activeMegaMenu === 'categories' ? 'categories' : 'brands'}...`}
                          className="w-full bg-foreground/10 border border-foreground/10 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>
                    
                    {/* Filtered Grid with Scroll Fade Mask */}
                    <div className="relative">
                      <div 
                        className="grid grid-cols-2 gap-2.5 p-4 px-6 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-track-transparent"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)' }}
                      >
                        {activeMegaMenu === 'categories' ? (
                          categories.filter(cat => cat.name.toLowerCase().includes(megaMenuQuery.toLowerCase())).length > 0 ? (
                            categories.filter(cat => cat.name.toLowerCase().includes(megaMenuQuery.toLowerCase())).slice(0, 10).map(cat => {
                              const isSelected = selectedCats.includes(cat.slug);
                              return (
                                <motion.div 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={cat.slug} 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCategory(cat.slug); }}
                                  className={`cursor-pointer rounded-xl transition-all duration-200 p-2.5 flex items-center gap-3 border ${
                                    isSelected 
                                      ? 'bg-accent-primary/20 border-accent-primary/50 shadow-inner' 
                                      : 'bg-foreground/10 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/10 hover:shadow-sm'
                                  }`}
                                >
                                  <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${isSelected ? 'bg-accent-primary text-background' : 'bg-foreground/10 text-foreground/'}`}>
                                    <Package className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`font-semibold text-sm truncate ${isSelected ? 'text-foreground' : 'text-foreground/'}`}>{cat.name}</span>
                                </motion.div>
                              );
                            })
                          ) : (
                            <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center">
                              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-3">
                                <Search className="w-5 h-5 text-foreground/" />
                              </div>
                              <p className="text-sm font-semibold text-foreground/">No categories found</p>
                              <p className="text-xs text-foreground/40 mt-1 max-w-[250px]">We couldn't find anything matching your search. Try another keyword!</p>
                            </div>
                          )
                        ) : (
                          brands.filter(b => b.toLowerCase().includes(megaMenuQuery.toLowerCase())).length > 0 ? (
                            brands.filter(b => b.toLowerCase().includes(megaMenuQuery.toLowerCase())).slice(0, 10).map(brand => {
                              const isSelected = selectedBrnds.includes(brand);
                              return (
                                <motion.div 
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={brand} 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBrand(brand); }}
                                  className={`cursor-pointer rounded-xl transition-all duration-200 p-2.5 flex items-center gap-3 border ${
                                    isSelected 
                                      ? 'bg-accent-primary/20 border-accent-primary/50 shadow-inner' 
                                      : 'bg-foreground/10 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/10 hover:shadow-sm'
                                  }`}
                                >
                                  <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${isSelected ? 'bg-accent-primary text-background' : 'bg-foreground/10 text-foreground/'}`}>
                                    <Store className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`font-semibold text-sm truncate ${isSelected ? 'text-foreground' : 'text-foreground/'}`}>{brand}</span>
                                </motion.div>
                              );
                            })
                          ) : (
                            <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center">
                              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-3">
                                <Search className="w-5 h-5 text-foreground/" />
                              </div>
                              <p className="text-sm font-semibold text-foreground/">No brands found</p>
                              <p className="text-xs text-foreground/40 mt-1 max-w-[250px]">We couldn't find anything matching your search. Try another keyword!</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 px-6 border-t border-foreground/10 bg-foreground/10 flex justify-between items-center backdrop-blur-md">
                      <span className="text-sm font-semibold text-foreground/">
                        {(activeMegaMenu === 'categories' ? selectedCats : selectedBrnds).length} items selected
                      </span>
                      <Button 
                        onClick={() => { applyNavigation(); setActiveMegaMenu(null); }} 
                        size="sm"
                        className="rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-white hover:bg-gray-200 text-black font-bold transition-all hover:scale-105 active:scale-95 px-5 h-9"
                      >
                        View Collection <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>
          </div>

          {/* Center: CommandBar (Search) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-4 relative z-20">
            <CommandBar />
          </div>

        {/* Right: Cart, Seller Centre, Auth */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
          
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden relative p-2 hover:bg-foreground/10 dark:hover:bg-foreground/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group inline-flex"
            aria-label="Search"
          >
             <Search className="w-5 h-5 text-foreground group-hover:text-indigo-400 transition-colors" />
          </button>

          <TooltipProvider delay={0}>
            <Tooltip>
              <TooltipTrigger>
                <Link href={sellerCentreLink} className="inline-flex relative p-2 hover:bg-foreground/10 dark:hover:bg-foreground/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group">
                  <Store className="w-5 h-5 text-foreground group-hover:text-indigo-400 transition-colors" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Seller Centre</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Link href="/wishlist" className="hidden md:inline-flex relative p-2 hover:bg-foreground/10 dark:hover:bg-foreground/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group">
                  <Heart className={`w-5 h-5 transition-colors duration-300 ${wishlistItems?.length > 0 ? 'fill-indigo-500 text-indigo-500' : 'text-foreground group-hover:text-indigo-400'}`} />
                  {wishlistItems?.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0.5 right-0 w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-background dark:ring-background"
                    >
                      {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                    </motion.span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>My Wishlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {user && (
            <NotificationDropdown 
              initialNotifications={initialNotifications} 
              initialUnreadCount={initialUnreadCount} 
            />
          )}

          <div className="relative hidden md:block">
            <Link 
              href="/cart"
              className="relative inline-flex p-2 hover:bg-foreground/10 dark:hover:bg-foreground/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-indigo-400 transition-colors" />
              {cartItems.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0 w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-background dark:ring-background"
                >
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </motion.span>
              )}
            </Link>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full bg-foreground/10 w-10 h-10 sm:w-11 sm:h-11 border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none group overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)] ml-2">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-foreground group-hover:text-indigo-400 transition-colors" />
                  )}
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                sideOffset={14}
                className="w-72 p-0 border-0 bg-transparent shadow-none"
              >
                {/* Outer gradient container with drop shadow */}
                <div className="relative rounded-[24px] bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-[1px] shadow-[0_0_40px_rgba(168,85,247,0.25)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* The outer glowing notch */}
                  <div className="absolute -top-[9px] right-[22px] w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rotate-45 rounded-tl-md z-0 shadow-[0_0_20px_rgba(236,72,153,0.4)] pointer-events-none"></div>
                  
                  {/* Inner dark container */}
                  <div className="relative z-10 w-full h-full bg-background/95 rounded-[23px] flex flex-col p-2 overflow-hidden">
                    
                    {/* Inner notch filler to make it seamless */}
                    <div className="absolute -top-[9px] right-[23px] w-[22px] h-[22px] bg-background/95 rotate-45 rounded-tl-sm z-20 pointer-events-none backdrop-blur-3xl"></div>

                    {/* Subtle mesh/particle background effect (Top Right) */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-purple-500/5 to-transparent pointer-events-none z-0"></div>

                    {/* Profile Header section */}
                    <DropdownMenuGroup className="relative z-30 mb-2">
                      <DropdownMenuLabel className="p-3 flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-orange-400 to-purple-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                             {profile?.profile_photo_url ? (
                                <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-foreground/" />
                              )}
                          </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-[15px] font-bold text-foreground tracking-wide truncate">{user.user_metadata?.name || 'Customer Account'}</p>
                          <p className="text-xs text-foreground/40 truncate font-medium mt-0.5">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1 z-30" />
                    
                    <DropdownMenuGroup className="relative z-30 px-1 py-1 space-y-1">
                      <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                        <Link href="/account" className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-purple-600/15 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-orange-400 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                          
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 !text-foreground/60 group-hover:!text-orange-400 group-data-[highlighted]/menuitem:!text-orange-400 transition-colors drop-shadow-[0_0_5px_rgba(245,158,11,0)] group-hover:drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                            <span className="!text-foreground/80 group-hover:!text-foreground group-data-[highlighted]/menuitem:!text-foreground transition-colors text-[14px] font-medium tracking-wide">My Profile</span>
                          </div>
                          <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-foreground/60 group-data-[highlighted]/menuitem:!text-foreground/60 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                        <Link href="/account/orders" className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-pink-600/15 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-purple-400 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                          
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 !text-foreground/60 group-hover:!text-purple-400 group-data-[highlighted]/menuitem:!text-purple-400 transition-colors drop-shadow-[0_0_5px_rgba(168,85,247,0)] group-hover:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                            <span className="!text-foreground/80 group-hover:!text-foreground group-data-[highlighted]/menuitem:!text-foreground transition-colors text-[14px] font-medium tracking-wide">Orders</span>
                          </div>
                          <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-foreground/60 group-data-[highlighted]/menuitem:!text-foreground/60 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                        <Link href="/wishlist" className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-rose-600/15 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-pink-400 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                          
                          <div className="flex items-center gap-3">
                            <Heart className="w-4 h-4 !text-foreground/60 group-hover:!text-pink-400 group-data-[highlighted]/menuitem:!text-pink-400 transition-colors drop-shadow-[0_0_5px_rgba(236,72,153,0)] group-hover:drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
                            <span className="!text-foreground/80 group-hover:!text-foreground group-data-[highlighted]/menuitem:!text-foreground transition-colors text-[14px] font-medium tracking-wide">Wishlist</span>
                          </div>
                          <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-foreground/60 group-data-[highlighted]/menuitem:!text-foreground/60 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1 z-30" />
                    
                    <DropdownMenuGroup className="relative z-30 px-1 py-1 space-y-1">
                      {(role === 'seller' || role === 'platform_admin') && (
                        <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                          <Link href={role === 'seller' ? '/seller' : '/platform-admin'} className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-indigo-600/15 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-blue-400 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                            
                            <div className="flex items-center gap-3">
                              <LayoutDashboard className="w-4 h-4 !text-foreground/60 group-hover:!text-blue-400 group-data-[highlighted]/menuitem:!text-blue-400 transition-colors drop-shadow-[0_0_5px_rgba(59,130,246,0)] group-hover:drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                              <span className="!text-foreground/80 group-hover:!text-foreground group-data-[highlighted]/menuitem:!text-foreground transition-colors text-[14px] font-medium tracking-wide">Dashboard</span>
                            </div>
                            <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-foreground/60 group-data-[highlighted]/menuitem:!text-foreground/60 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                        <Link href="/account/settings" className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 to-purple-600/15 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-indigo-400 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                          
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4 !text-foreground/60 group-hover:!text-indigo-400 group-data-[highlighted]/menuitem:!text-indigo-400 transition-colors drop-shadow-[0_0_5px_rgba(99,102,241,0)] group-hover:drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                            <span className="!text-foreground/80 group-hover:!text-foreground group-data-[highlighted]/menuitem:!text-foreground transition-colors text-[14px] font-medium tracking-wide">Settings</span>
                          </div>
                          <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-foreground/60 group-data-[highlighted]/menuitem:!text-foreground/60 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1 z-30" />
                    
                    <div className="relative z-30 px-1 py-1 pb-2">
                      <form onSubmit={handleLogout}>
                        <DropdownMenuItem className="p-0 focus:bg-transparent cursor-pointer rounded-xl group/menuitem">
                          <button type="submit" disabled={isPending} className="relative group flex items-center justify-between w-full p-1.5 sm:p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-600/10 opacity-0 group-hover:opacity-100 group-data-[highlighted]/menuitem:opacity-100 transition-opacity duration-300 rounded-xl" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-red-500 group-hover:h-1/2 group-data-[highlighted]/menuitem:h-1/2 transition-all duration-300 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            
                            <div className="flex items-center gap-3">
                              {isPending ? (
                                <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                              ) : (
                                <LogOut className="w-4 h-4 !text-foreground/60 group-hover:!text-red-400 group-data-[highlighted]/menuitem:!text-red-400 transition-colors drop-shadow-[0_0_5px_rgba(239,68,68,0)] group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] group-data-[highlighted]/menuitem:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                              )}
                              <span className="!text-rose-400/90 group-hover:!text-rose-400 group-data-[highlighted]/menuitem:!text-rose-400 transition-colors text-[14px] font-medium tracking-wide">
                                {isPending ? 'Logging out...' : 'Log out'}
                              </span>
                            </div>
                            <ChevronDown className="w-4 h-4 !text-foreground/20 group-hover:!text-rose-400/80 group-data-[highlighted]/menuitem:!text-rose-400/80 group-hover:translate-x-1 group-data-[highlighted]/menuitem:translate-x-1 transition-all -rotate-90" />
                          </button>
                        </DropdownMenuItem>
                      </form>
                    </div>

                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 ml-2 sm:ml-4">
              <Link 
                href="/login" 
                className={`hidden sm:flex items-center text-[15px] font-medium transition-all duration-200 relative group ${
                  pathname === '/login' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
                <div className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-foreground transition-all duration-300 ease-out ${
                  pathname === '/login' ? 'w-full' : 'w-[calc(100%-1rem)] group-hover:w-full'
                }`} />
              </Link>
              
              <Link href="/account" className="md:hidden relative p-1.5 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none">
    <User className="w-5 h-5 text-foreground" />
  </Link>
  <Link 
    href="/signup" 
    className={`hidden md:flex group relative items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full border transition-all duration-300 ease-out overflow-hidden hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      pathname === '/signup' 
        ? 'border-indigo-500/30 bg-indigo-50/50 shadow-[0_2px_12px_rgba(99,102,241,0.15)] dark:border-indigo-400/30 dark:bg-indigo-500/10' 
        : 'border-border/80 bg-background shadow-sm hover:shadow-md hover:border-border hover:bg-muted/50'
    }`}
  >
    {/* Subtle animated hover glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    <span className={`relative z-10 text-[14px] font-semibold tracking-wide transition-colors ${
      pathname === '/signup' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'
    }`}>
      Sign Up
    </span>
    
    {/* Circular Arrow Badge */}
    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50 shadow-sm transition-all duration-300 ease-out group-hover:bg-foreground group-hover:text-background group-hover:border-foreground group-hover:scale-105">
      <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-[2px]" />
    </div>
  </Link>
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden w-full bg-background border-b border-border/50 p-4 shadow-xl overflow-hidden"
          >
            <CommandBar />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

