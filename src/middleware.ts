import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildAdminAuthToken } from '@/lib/admin-auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const ADMIN_AUTH_TOKEN = ADMIN_PASSWORD ? buildAdminAuthToken(ADMIN_PASSWORD) : ''

const isAuthorized = (req: NextRequest) => {
  if (!ADMIN_PASSWORD) return true
  const cookie = req.cookies.get('admin_auth')?.value || ''
  return cookie === ADMIN_AUTH_TOKEN
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin-login') || pathname.startsWith('/api/admin-login')) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  if (isAuthorized(req)) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = '/admin-login'
  url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login', '/api/admin-login'],
}
