import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let cookieName = 'sb-nova-customer-auth-token'
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname
    if (pathname.startsWith('/admin') || pathname.startsWith('/admin')) {
      cookieName = 'sb-nova-admin-auth-token'
    } else if (pathname.startsWith('/seller')) {
      cookieName = 'sb-nova-seller-auth-token'
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: cookieName,
      }
    }
  )
}
