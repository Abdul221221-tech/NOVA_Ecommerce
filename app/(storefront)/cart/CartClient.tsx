'use client'

import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ShieldCheck, Truck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { updateCartItemQuantity, removeCartItem } from '@/app/actions/cart'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { calculateGlobalTotals, PRICING_CONFIG } from '@/lib/pricing'
export default function CartPage() {
  const { cartItems, refreshCart } = useStorefront()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const handleUpdateQuantity = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 1) return
    
    setIsUpdating(itemId)
    try {
      await updateCartItemQuantity(itemId, newQuantity)
      await refreshCart()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId)
    try {
      await removeCartItem(itemId)
      await refreshCart()
      toast.success('Item removed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleProceedToCheckout = async () => {
    setIsNavigating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please log in or sign up to continue to checkout')
      router.push('/signup?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-7xl flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          Looks like you haven't added anything yet. Discover our latest collections and find your new favorites.
        </p>
        <Link href="/products" className="bg-foreground text-background hover:bg-foreground/90 transition-colors px-8 py-3.5 rounded-full font-bold flex items-center justify-center">
          Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    )
  }

  // Calculate totals using centralized engine
  const pricingInput: Record<string, { storeName: string, items: any[] }> = {}

  cartItems.forEach(item => {
    const variant = item.product_variants
    const product = variant.products
    const store = product.stores
    const price = variant.price_override ?? product.price
    const primaryImage = product.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url
    
    if (!pricingInput[store.id]) {
      pricingInput[store.id] = {
        storeName: store.name,
        items: []
      }
    }
    
    pricingInput[store.id].items.push({
      ...item,
      title: product.title,
      price,
      size: variant.size,
      color: variant.color,
      image: primaryImage,
      quantity: item.quantity,
      gst_rate: product.gst_rate // May be undefined in cart view, but fallback handles it
    })
  })

  // We can just alias itemsByStore to pricingInput for rendering
  const itemsByStore = pricingInput
  const totals = calculateGlobalTotals(pricingInput)
  
  const subtotal = totals.globalSubtotal
  const eligibleForCheckout = subtotal // Kept for backwards compatibility in JSX
  const shippingCharge = totals.globalShipping
  // finalTotal for cart preview (GST is calculated exactly at checkout when address is known, though we have a globalGst estimate here)
  const finalTotal = subtotal + shippingCharge

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl min-h-[70vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">Shopping Cart</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-col-reverse lg:flex-row">
        {/* Left Column: Cart Items Grouped by Seller */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="space-y-6">
            {Object.values(itemsByStore).map((storeGroup: any, idx) => (
              <div key={idx} className="bg-surface-base p-4 sm:p-6 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Sold by</span>
                    {storeGroup.storeName}
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {storeGroup.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 sm:gap-6">
                      <div className="relative size-20 sm:size-24 md:size-32 rounded-xl overflow-hidden bg-muted/20 shrink-0 border">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-semibold text-lg line-clamp-1">{item.title}</h4>
                            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                              {item.size && <span>Size: <span className="font-medium text-foreground">{item.size}</span></span>} 
                              {item.color && <span>Color: <span className="font-medium text-foreground">{item.color}</span></span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-muted-foreground mt-0.5">₹{item.price.toLocaleString('en-IN')} each</div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-muted/30 rounded-full border border-border/50 p-1">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={isUpdating === item.id || item.quantity <= 1}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background disabled:opacity-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating === item.id}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background disabled:opacity-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating === item.id}
                            className="text-muted-foreground hover:text-status-error transition-colors flex items-center gap-1.5 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-surface-base p-6 md:p-8 rounded-2xl border shadow-sm sticky top-24">
            <h2 className="text-xl font-bold font-heading mb-6 border-b pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {eligibleForCheckout !== subtotal && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Eligible Subtotal</span>
                  <span className="font-medium text-foreground">₹{eligibleForCheckout.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Estimate</span>
                {eligibleForCheckout > 0 ? (
                  <span className="font-medium text-status-success">
                    {shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toLocaleString('en-IN')}`}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </div>
              
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-base font-semibold">Estimated Total</span>
                <span className="text-2xl font-bold font-heading">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              disabled={eligibleForCheckout === 0 || isNavigating}
              className="hidden md:flex w-full h-14 bg-foreground text-background hover:bg-accent-primary hover:text-white transition-all rounded-xl font-bold text-lg items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isNavigating ? 'Processing...' : 'Proceed to Order'}
              {!isNavigating && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            {eligibleForCheckout === 0 && subtotal > 0 && (
              <p className="text-xs text-status-error text-center mt-3">
                No items are currently eligible for checkout.
              </p>
            )}

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Secure Checkout powered by Stripe</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
                <Truck className="w-5 h-5 text-emerald-500" />
                <span>Free shipping on store orders over ₹{PRICING_CONFIG.FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
