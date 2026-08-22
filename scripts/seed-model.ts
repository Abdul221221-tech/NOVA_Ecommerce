import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function seedModel() {
  const { data: products } = await supabase.from('products').select('id, title').limit(1)
  if (!products || products.length === 0) {
    console.log('No products found to attach model to.')
    return
  }

  const p = products[0]
  const modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  
  const { error } = await supabase.from('products').update({ model_url: modelUrl }).eq('id', p.id)
  if (error) {
    console.error('Failed to update product:', error)
  } else {
    console.log(`Successfully attached 3D model to product: ${p.title} (ID: ${p.id})`)
  }
}

seedModel()
