import { getWishlistProducts } from '@/app/actions/wishlist'
import { ClientWishlist } from './ClientWishlist'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Wishlist | NOVA'
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?callbackUrl=/wishlist')
  }

  const products = await getWishlistProducts()
  
  return <ClientWishlist initialProducts={products} />
}
