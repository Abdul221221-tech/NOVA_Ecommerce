import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data: categories } = await supabase.from('categories').select('id, name')
  const { data: products } = await supabase.from('products').select('id, category_id')

  if (!categories || !products) return console.log('Error fetching')

  const counts: Record<string, number> = {}
  categories.forEach(c => { counts[c.name] = 0 })
  products.forEach(p => {
    const cat = categories.find(c => c.id === p.category_id)
    if (cat) counts[cat.name]++
  })

  console.log("Total Products:", products.length)
  console.log("Counts per category:")
  console.log(counts)
}

check()
