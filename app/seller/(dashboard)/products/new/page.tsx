import { createClient } from '@/lib/supabase/server'
import ProductEditorClient from '../ProductEditorClient'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ProductEditorClient categories={categories || []} />
    </div>
  )
}
