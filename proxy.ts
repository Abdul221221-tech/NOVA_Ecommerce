import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const rateLimitMap = new Map<string, { count: number, timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5 // max 5 auth requests per minute

export async function proxy(request: NextRequest) {
  // Rate limiting for Auth endpoints
  if (request.method === 'POST' && (request.nextUrl.pathname.includes('/login') || request.nextUrl.pathname.includes('/signup'))) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const userRecord = rateLimitMap.get(ip)
    
    if (userRecord) {
      if (now - userRecord.timestamp < RATE_LIMIT_WINDOW) {
        if (userRecord.count >= MAX_REQUESTS) {
          return new NextResponse('Too Many Requests', { status: 429 })
        }
        userRecord.count += 1
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
