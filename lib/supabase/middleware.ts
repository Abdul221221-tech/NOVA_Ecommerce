import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })

  
  const path = request.nextUrl.pathname;
  let cookieName = 'sb-nova-customer-auth-token'
  if (path.startsWith('/admin') || path.startsWith('/platform-admin')) {
    cookieName = 'sb-nova-admin-auth-token'
  } else if (path.startsWith('/seller')) {
    cookieName = 'sb-nova-seller-auth-token'
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: cookieName,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            }
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()
  


  if (user) {
    // Get role from profile to be completely secure, or fallback to metadata
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || user.user_metadata?.role || 'customer'
    
    if (path.startsWith('/seller')) {
      if (role !== 'seller' && role !== 'platform_admin' && !path.startsWith('/seller/login') && !path.startsWith('/seller/signup')) {
        return NextResponse.redirect(new URL('/seller/signup', request.url))
      }
      
      // Seller flow: check for store
      if (role === 'seller' && path !== '/seller/create-store') {
        const { data: store } = await supabase.from('stores').select('id, status').eq('owner_id', user.id).single()
        
        if (!store) {
           return NextResponse.redirect(new URL('/seller/create-store', request.url))
        }

        // If they have a store, check its status. 
        // Allow access to /seller/pending and /seller/suspended explicitly.
        if (store.status === 'pending' && path !== '/seller/pending') {
          return NextResponse.redirect(new URL('/seller/pending', request.url))
        }
        if (store.status === 'suspended' && path !== '/seller/suspended') {
          return NextResponse.redirect(new URL('/seller/suspended', request.url))
        }
        
        // If approved, but they try to access pending/suspended, send them to dashboard
        if (store.status === 'approved' && (path === '/seller/pending' || path === '/seller/suspended')) {
          return NextResponse.redirect(new URL('/seller', request.url))
        }
      }
    }
    
    if (path.startsWith('/platform-admin')) {
      if (role !== 'platform_admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } else {
    if (path.startsWith('/seller') && !path.startsWith('/seller/login') && !path.startsWith('/seller/signup')) {
      return NextResponse.redirect(new URL('/seller/login', request.url))
    }
    if (path.startsWith('/platform-admin') && !path.startsWith('/platform-admin/login')) {
      return NextResponse.redirect(new URL('/platform-admin/login', request.url))
    }
  }

  return supabaseResponse
}
