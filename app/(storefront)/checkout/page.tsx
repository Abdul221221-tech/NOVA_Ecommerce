import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import CheckoutFlow from '@/components/storefront/CheckoutFlow'
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  
  if (!user) {
    redirect('/signup?redirect=/checkout')
  }

  let cartId: string | null = null
  let profile = {}
  
  if (user) {
    const { data } = await supabase.from('carts').select('id').eq('customer_id', user.id).single()
    cartId = data?.id
    
    const { data: profileData } = await supabase.from('profiles').select('name, mobile_number, address, city, state, pincode').eq('id', user.id).single()
    if (profileData) profile = profileData
  } else {
    const sessionId = cookieStore.get('cart_session')?.value
    if (sessionId) {
      const { data } = await supabase.from('carts').select('id').eq('session_id', sessionId).single()
      cartId = data?.id
    }
  }

  // Fetch cart items with nested products/stores
  let cartItems: any[] = []
  if (cartId) {
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id, quantity,
        product_variants (
          id, size, color, price_override,
          products (
            id, title, price,
            stores ( id, name, stripe_connect_account_id ),
            product_images ( url, sort_order )
          )
        )
      `)
      .eq('cart_id', cartId)
    if (data) cartItems = data
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

  // Group items by store for display
  const itemsByStore: Record<string, any> = {}
  let validSubtotal = 0

  cartItems.forEach(item => {
    const variant = item.product_variants
    const product = variant.products
    const store = product.stores
    const price = variant.price_override ?? product.price
    const primaryImage = product.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order)[0]?.url
    
    if (!itemsByStore[store.id]) {
      itemsByStore[store.id] = {
        storeName: store.name,
        hasStripe: !!store.stripe_connect_account_id,
        items: []
      }
    }
    
    itemsByStore[store.id].items.push({
      ...item,
      title: product.title,
      price,
      size: variant.size,
      color: variant.color,
      image: primaryImage
    })

  })

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">Checkout</h1>
      </div>
      
      <CheckoutFlow 
        itemsByStore={itemsByStore}
        profile={profile}
      />
    </div>
  )
}
