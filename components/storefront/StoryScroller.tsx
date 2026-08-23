'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { addToCart } from '@/app/actions/cart'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export function StoryScroller({ product, primaryImage, otherImages }: { product: any, primaryImage: string, otherImages: any[] }) {
  const container = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const { refreshCart } = useStorefront() // Trigger global cart update
  const router = useRouter()
  const pathname = usePathname()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    // Check OS reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useGSAP(() => {
    if (reduceMotion) return // Disable all GSAP if reduced motion

    const sections = gsap.utils.toArray('.story-panel')
    
    // Pin the image while scrolling through sections
    ScrollTrigger.create({
      trigger: container.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: imageRef.current,
    })

    // Fade text panels in and out
    sections.forEach((panel: any, i: number) => {
      gsap.fromTo(panel, 
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0,
          scrollTrigger: {
            trigger: panel,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          }
        }
      )
      
      // Slightly scale the image on each new section
      gsap.to(imageRef.current, {
        scale: 1 + (i * 0.1),
        scrollTrigger: {
          trigger: panel,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        }
      })
    })
  }, { scope: container, dependencies: [reduceMotion] })

  const handleSkipToBuy = async () => {
    try {
      setAdded(true)
      const variantId = product.variants?.[0]?.id
      if (!variantId) {
        toast.error("Product variant not found")
        setAdded(false)
        return
      }
      await addToCart(variantId, 1)
      refreshCart()
      toast.success("Added to cart!")
      setTimeout(() => setAdded(false), 2000)
    } catch (e: any) {
      setAdded(false)
      if (e.message === "AUTH_REQUIRED") {
        toast.error("Please log in or sign up to continue.")
        router.push(`/signup?redirect=${encodeURIComponent(pathname)}`)
      } else {
        console.error(e)
        toast.error(e.message || "Failed to add to cart")
      }
    }
  }

  // Fallback layout for reduced motion
  if (reduceMotion) {
    return (
      <div className="bg-background min-h-screen pb-32">
        <div className="container mx-auto px-4 max-w-4xl py-12 space-y-12">
           <Link href={`/products/${product.id}`} className="inline-flex items-center text-sm font-medium hover:text-accent-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Product
           </Link>
           
           <div className="aspect-square relative rounded-2xl overflow-hidden border">
             <Image src={primaryImage} alt="Product image" fill className="object-cover" />
           </div>

           <div className="space-y-6 prose prose-lg dark:prose-invert max-w-none">
             <h1 className="font-heading text-4xl font-bold">{product.title}</h1>
             <p>{product.description}</p>
             <div className="border-t pt-6 text-xl font-bold">
               ${product.price.toFixed(2)}
             </div>
             <Link href={`/products/${product.id}`} className="block w-full bg-accent-primary text-white text-center py-4 rounded-full font-bold">
               Buy Now
             </Link>
           </div>
        </div>
      </div>
    )
  }

  // GSAP Immersive Layout
  return (
    <div ref={container} className="relative bg-background text-foreground">
      
      {/* Skip to Buy Floating Action Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/50 backdrop-blur-md border-b">
        <Link href={`/products/${product.id}`} className="inline-flex items-center text-sm font-medium hover:text-accent-primary bg-background/80 p-2 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4 bg-background/80 p-2 pl-4 rounded-full shadow-sm border">
          <span className="font-heading font-bold">₹{product.price.toLocaleString('en-IN')}</span>
          <button 
            onClick={handleSkipToBuy}
            className="bg-accent-primary text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-accent-primary/90 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> {added ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left Side: Pinned Image */}
        <div className="w-full md:w-1/2 h-screen relative hidden md:block">
          <div ref={imageRef} className="absolute inset-0 w-full h-full flex items-center justify-center p-12">
            <div className="relative w-full h-[80vh] rounded-3xl overflow-hidden shadow-2xl border bg-muted/20">
               <Image src={primaryImage} alt={product.title} fill className="object-cover" priority />
            </div>
          </div>
        </div>
        
        {/* Mobile Sticky Image Fallback */}
        <div className="w-full h-[50vh] md:hidden sticky top-0 z-0">
           <Image src={primaryImage} alt={product.title} fill className="object-cover" priority />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Right Side: Scrolling Narrative */}
        <div className="w-full md:w-1/2 relative z-10">
          
          <div className="story-panel h-screen flex flex-col justify-center px-8 md:px-16 md:-mt-24">
            <p className="text-accent-primary font-bold tracking-widest uppercase text-sm mb-4">Discover</p>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
              {product.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Scroll to explore the design, craftsmanship, and details of this exclusive piece.
            </p>
          </div>

          <div className="story-panel h-screen flex flex-col justify-center px-8 md:px-16">
            <h2 className="font-heading text-4xl font-bold mb-6">The Craft</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              {product.description}
            </p>
            {otherImages[0] && (
              <div className="mt-8 relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border">
                <Image src={otherImages[0].url} alt="Detail view" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="story-panel h-screen flex flex-col justify-center px-8 md:px-16">
            <h2 className="font-heading text-4xl font-bold mb-6">Make It Yours</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-12">
              Ready to elevate your collection? Purchase this premium piece directly from {product.stores?.name || 'the seller'}.
            </p>
            
            <Link href={`/products/${product.id}`} className="inline-flex items-center justify-center bg-foreground text-background w-full max-w-sm py-5 rounded-full text-lg font-bold hover:bg-foreground/90 transition-transform hover:scale-105 active:scale-95 shadow-xl">
              Return to Checkout
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
