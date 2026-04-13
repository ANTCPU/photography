// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const VALID_USERS = ['amanda', 'antcpu'] as const
type ValidUser = typeof VALID_USERS[number]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { password, user } = body as { password: string; user: string }

  if (!password || password !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  if (!user || !VALID_USERS.includes(user as ValidUser)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, user })

  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }

  res.cookies.set('upload_token', process.env.UPLOAD_SECRET!, cookieOpts)
  res.cookies.set('user', user, cookieOpts)

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('upload_token')
  res.cookies.delete('user')
  return res
}
