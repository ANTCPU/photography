// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('upload_token')?.value

  if (!token || token !== process.env.UPLOAD_SECRET) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname) // remember where they came from
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
