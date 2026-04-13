// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('upload_token')?.value

  if (token && token === process.env.UPLOAD_SECRET) {
    const user = req.cookies.get('user')?.value ?? null
    return NextResponse.json({ ok: true, user }, { status: 200 })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
