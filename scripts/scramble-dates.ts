import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function scramble() {
  console.log('Fetching products...')
  const { data: products } = await supabase.from('products').select('id')
  if (!products) return console.log('No products found')

  console.log(`Scrambling dates for ${products.length} products...`)
  const now = new Date()

  for (const p of products) {
    // Random date within the last 30 days
    const randomDaysAgo = Math.random() * 30
    const randomDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000)
    
    await supabase.from('products')
      .update({ created_at: randomDate.toISOString() })
      .eq('id', p.id)
  }

  console.log('Successfully scrambled all product created_at timestamps.')
}

scramble()
