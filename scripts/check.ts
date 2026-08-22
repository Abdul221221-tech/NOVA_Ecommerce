import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data: stores } = await supabase.from('stores').select('*')
  console.log('Stores:', stores?.length)

  const { data: products } = await supabase.from('products').select('*')
  console.log('Products:', products?.length)

  const { data: q, error: qError } = await supabase
    .from('products')
    .select(`
      id, title, price, compare_at_price, description, category, brand,
      stores!inner ( 
        name, slug, status
      )
    `)
    .eq('status', 'active')
    .eq('stores.status', 'approved')

  console.log('Query error:', qError)
  console.log('Query result:', q?.length)
}

check()
