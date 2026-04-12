// app/api/assets/route.ts
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { PLACEHOLDERS, PLATFORM } from '@/lib/constants'

export const runtime = 'edge'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
}

export async function GET() {
  try {
    const assets = ((await kv.get('assets')) ?? []) as any[]

    return NextResponse.json(
      {
        // Platform identity — external apps know who they're talking to
        platform: {
          name:      PLATFORM.name,
          baseUrl:   PLATFORM.baseUrl,
          publicSite: PLATFORM.publicSite,
        },
        // Default images — always available, never null
        // External apps use these when no specific image is available
        defaults: {
          profile:   PLACEHOLDERS.profile,
          banner:    PLACEHOLDERS.banner,
          thumbnail: PLACEHOLDERS.thumbnail,
        },
        // Assets
        count:  assets.length,
        assets,
      },
      { status: 200, headers: HEADERS }
    )
  } catch (err) {
    console.error('Assets fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch assets', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }
}
