import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headerList = await headers()
  
  const pathname = headerList.get('x-pathname') || ''
  const referer = headerList.get('referer') || ''
  
  let cookieName = 'sb-nova-customer-auth-token'
  if (pathname.startsWith('/admin') || referer.includes('/admin')) {
    cookieName = 'sb-nova-admin-auth-token'
  } else if (pathname.startsWith('/seller') || referer.includes('/seller')) {
    cookieName = 'sb-nova-seller-auth-token'
  } else if (pathname.startsWith('/platform-admin') || referer.includes('/platform-admin')) {
    cookieName = 'sb-nova-admin-auth-token'
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: cookieName,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const rememberMe = cookieStore.get('nova-remember-me')?.value !== 'false'
            cookiesToSet.forEach(({ name, value, options }) => {
              // If remember me is false, we want the auth token to expire when the browser closes (session cookie)
              if (!rememberMe && name.includes('auth-token')) {
                delete options.maxAge
                delete options.expires
              }
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
