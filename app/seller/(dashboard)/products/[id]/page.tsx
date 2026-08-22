import { createClient } from '@/lib/supabase/server'
import ProductEditorClient from '../ProductEditorClient'
import { notFound, redirect } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/seller/login')
  
  const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
  if (!store || store.status !== 'approved') redirect('/seller/pending')

  // Fetch the product ensuring it belongs to the current store (security check)
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*),
      product_images (*)
    `)
    .eq('id', params.id)
    .eq('store_id', store.id)
    .single()

  if (!product) {
    notFound() // This ensures sellers cannot guess IDs of other sellers' products to view them in the editor.
  }

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ProductEditorClient initialData={product} categories={categories || []} />
    </div>
  )
}
