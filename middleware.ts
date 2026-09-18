// middleware.ts
// Auth guard for protected routes
// Protects: /dashboard, /studio
// Token: upload_token cookie vs UPLOAD_SECRET env var
// On fail: redirects to /login?from=<path>

import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/studio']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('upload_token')?.value

  if (!token || token !== process.env.UPLOAD_SECRET) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/studio/:path*'],
}
