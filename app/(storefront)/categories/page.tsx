import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/ui/GradientText'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch categories with product counts (via RPC or just fetch categories for now)
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // Map category slugs to a generic high-quality Unsplash image for the index
  const categoryImages: Record<string, string> = {
    'footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'apparel-men': 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80',
    'apparel-women': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'accessories': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    'bags': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'home-living': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
    'electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
  }

  return (
    <div className="container mx-auto px-4 md:px-8 xl:px-12 w-full max-w-[1600px] py-16">
      <div className="text-center space-y-4 mb-16">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">
          <GradientText>Shop by Category</GradientText>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of premium collections.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted/20">
            <Image
              src={categoryImages[cat.slug] || categoryImages['accessories']}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h2 className="text-2xl font-bold text-white mb-2">{cat.name}</h2>
              <span className="text-white/80 text-sm font-medium opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                Explore Collection &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
