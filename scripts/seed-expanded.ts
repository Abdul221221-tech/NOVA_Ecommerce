import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SEED_SELLER_EMAIL = process.env.SEED_SELLER_EMAIL || 'seller@novamarket.com'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BRANDS = ['Northline', 'Verve & Co.', 'Kessler Studio', 'Palm & Pine', 'Aura', 'Meridian', 'Apex', 'Solstice', 'Lumina', 'Echo']

const CATEGORIES = [
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Apparel — Men', slug: 'apparel-men' },
  { name: 'Apparel — Women', slug: 'apparel-women' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Bags', slug: 'bags' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' }
]

const IMAGES = {
  'footwear': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'
  ],
  'apparel-men': [
    'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'
  ],
  'apparel-women': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80',
    'https://images.unsplash.com/photo-1434389678241-000c0f99478f?w=800&q=80'
  ],
  'accessories': [
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80'
  ],
  'bags': [
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'
  ],
  'home-living': [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
    'https://images.unsplash.com/photo-1531835551805-16d8e4f4fb38?w=800&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80'
  ],
  'electronics': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'
  ],
  'beauty-personal-care': [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80'
  ]
}

const ADJECTIVES = ['Classic', 'Everyday', 'Premium', 'Essential', 'Minimalist', 'Modern', 'Vintage', 'Signature', 'Pro', 'Aero']
const NOUNS: Record<string, string[]> = {
  'footwear': ['Sneakers', 'Runners', 'Boots', 'Loafers', 'Trainers', 'High-Tops'],
  'apparel-men': ['Tee', 'Jacket', 'Hoodie', 'Pants', 'Shorts', 'Sweater'],
  'apparel-women': ['Dress', 'Blouse', 'Skirt', 'Jacket', 'Tee', 'Leggings'],
  'accessories': ['Watch', 'Sunglasses', 'Belt', 'Wallet', 'Hat', 'Scarf'],
  'bags': ['Tote', 'Backpack', 'Messenger', 'Duffel', 'Clutch'],
  'home-living': ['Throw Pillow', 'Blanket', 'Vase', 'Lamp', 'Candle', 'Rug'],
  'electronics': ['Headphones', 'Speaker', 'Charger', 'Smartwatch', 'Earbuds'],
  'beauty-personal-care': ['Serum', 'Moisturizer', 'Cleanser', 'Mask', 'Perfume']
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateProductName(categorySlug: string) {
  const adj = randItem(ADJECTIVES)
  const noun = randItem(NOUNS[categorySlug] || ['Item'])
  return `${adj} ${noun}`
}

function generatePrice(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

async function runSeed() {
  console.log('Starting Expanded Seed Data Generation...')

  // 1. SELLER / STORE
  let ownerId: string
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: SEED_SELLER_EMAIL,
    password: 'SeedPassword123!',
    email_confirm: true,
    user_metadata: { role: 'seller', name: 'NOVA Seed Seller' }
  })
  
  if (userError && userError.message.toLowerCase().includes('already')) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const user = existingUsers.users.find(u => u.email === SEED_SELLER_EMAIL)
    if (!user) throw new Error('Could not find existing seller user')
    ownerId = user.id
  } else if (userData?.user) {
    ownerId = userData.user.id
  } else {
    console.error('Auth Error:', userError)
    throw new Error('Failed to create or find seller')
  }

  // Ensure profile
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', ownerId).single()
  if (!profile) {
    await supabase.from('profiles').insert({ id: ownerId, role: 'seller', email: SEED_SELLER_EMAIL })
  } else {
    await supabase.from('profiles').update({ role: 'seller' }).eq('id', ownerId)
  }

  // Upsert Store
  const storeSlug = 'nova-official'
  let storeId: string
  const { data: existingStore } = await supabase.from('stores').select('id').eq('slug', storeSlug).single()
  
  if (existingStore) {
    storeId = existingStore.id
    console.log(`Store "NOVA Official Store" already exists (ID: ${storeId})`)
  } else {
    const { data: newStore, error: storeError } = await supabase.from('stores').insert({
      owner_id: ownerId,
      name: 'NOVA Official Store',
      slug: storeSlug,
      description: 'Official seeded demo store for NOVA platform.',
      status: 'approved',
      stripe_connect_account_id: 'acct_1OuLz6QzBqVd8pZj' // Dummy but valid format
    }).select('id').single()
    if (storeError) throw storeError
    storeId = newStore.id
    console.log(`Created new store: NOVA Official Store`)
  }

  // 2. CATEGORIES
  const categoryIds: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', cat.slug).single()
    if (existingCat) {
      categoryIds[cat.slug] = existingCat.id
    } else {
      const { data: newCat, error: catError } = await supabase.from('categories').insert({
        name: cat.name,
        slug: cat.slug
      }).select('id').single()
      if (catError) throw catError
      categoryIds[cat.slug] = newCat.id
    }
  }
  console.log(`Ensured ${CATEGORIES.length} categories exist.`)

  // 3. PRODUCTS
  let totalCreated = 0
  
  // We want ~100-120 total, so ~14 per category
  for (const cat of CATEGORIES) {
    for (let i = 0; i < 14; i++) {
      const brand = randItem(BRANDS)
      const title = generateProductName(cat.slug)
      
      // Determine pricing
      let price = generatePrice(25, 200)
      if (i === 0) price = generatePrice(5, 15) // Boundary low
      if (i === 1) price = generatePrice(500, 1200) // Boundary high
      
      let compareAtPrice = null
      // ~10% chance of discount
      if (Math.random() < 0.1) {
        compareAtPrice = parseFloat((price * 1.3).toFixed(2))
      }

      // Description
      const description = `${brand} presents the ${title}. Crafted with premium materials for everyday use. Experience unparalleled quality and design.`

      const { data: product, error: productError } = await supabase.from('products').insert({
        store_id: storeId,
        category_id: categoryIds[cat.slug],
        title,
        description,
        price,
        compare_at_price: compareAtPrice,
        status: 'active',
        brand
      }).select('id').single()

      if (productError) throw productError

      // Images
      const catImages = IMAGES[cat.slug as keyof typeof IMAGES] || IMAGES['accessories']
      const numImages = Math.floor(Math.random() * 2) + 2 // 2 or 3 images
      
      // Select random unique images
      const shuffledImages = [...catImages].sort(() => 0.5 - Math.random())
      const selectedImages = shuffledImages.slice(0, numImages)
      
      for (let j = 0; j < selectedImages.length; j++) {
        await supabase.from('product_images').insert({
          product_id: product.id,
          url: selectedImages[j],
          alt_text: `${title} view ${j+1}`,
          sort_order: j
        })
      }

      // Variants
      const sizes = cat.slug.includes('footwear') ? ['8', '9', '10', '11'] : 
                    cat.slug.includes('apparel') ? ['S', 'M', 'L', 'XL'] : 
                    cat.slug === 'home-living' ? ['Standard'] : ['One Size']
      const colors = ['Black', 'White', 'Navy', 'Olive']

      const numVariants = Math.floor(Math.random() * 2) + 2 // 2 or 3 variants
      const selectedSizes = [...sizes].sort(() => 0.5 - Math.random()).slice(0, numVariants)
      const color = randItem(colors)

      for (let k = 0; k < selectedSizes.length; k++) {
        const size = selectedSizes[k]
        
        // Stock logic
        let stock_quantity = Math.floor(Math.random() * 50) + 10 // Normal 10-60
        
        // Randomly force low stock or out of stock
        const r = Math.random()
        if (r < 0.05) stock_quantity = 0 // 5% out of stock
        else if (r < 0.1) stock_quantity = Math.floor(Math.random() * 3) + 1 // 5% low stock (1-4)

        const sku = `${brand.substring(0,3).toUpperCase()}-${cat.slug.substring(0,3).toUpperCase()}-${color.substring(0,3).toUpperCase()}-${size}`

        await supabase.from('product_variants').insert({
          product_id: product.id,
          sku,
          size,
          color,
          stock_quantity
        })
      }
      
      // Reviews
      // Randomly assign a review
      if (Math.random() < 0.2) {
        await supabase.from('reviews').insert({
          product_id: product.id,
          customer_id: ownerId, // just using the seller as the review author for simplicity
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
          comment: "Absolutely love this! The quality exceeded my expectations and it arrived super fast. Highly recommended.",
        })
      }

      totalCreated++
    }
  }

  console.log(`\n✅ Seeding Complete!`)
  console.log(`Generated ${totalCreated} products across ${CATEGORIES.length} categories.`)
}

runSeed().catch(console.error)
