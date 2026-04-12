// app/api/auth/route.ts
// Minimal login — one password, one cookie, done
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.UPLOAD_SECRET) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true })

  // Set cookie — 7 day session
  res.cookies.set('upload_token', process.env.UPLOAD_SECRET!, {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('upload_token')
  return res
}
