import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StoryScroller } from '@/components/storefront/StoryScroller'

export default async function ProductStoryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      id, title, price, description,
      stores ( name, slug ),
      product_images ( url, sort_order )
    `)
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  // Sort images
  const images = (product.product_images || []).sort((a:any, b:any) => a.sort_order - b.sort_order)
  const primaryImage = images[0]?.url
  const otherImages = images.slice(1)

  if (!primaryImage) {
    return <div className="p-24 text-center">No images available for this story.</div>
  }

  return (
    <main className="min-h-screen bg-background">
      <StoryScroller 
        product={product} 
        primaryImage={primaryImage} 
        otherImages={otherImages} 
      />
    </main>
  )
}
