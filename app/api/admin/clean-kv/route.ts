// app/api/admin/clean-kv/route.ts
// One-time utility: deduplicates KV assets by id, removes test/placeholder entries
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(req: NextRequest) {
  // Simple auth gate — pass ?secret=YOUR_UPLOAD_SECRET in URL
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assets = ((await kv.get('assets')) ?? []) as any[]

  const before = assets.length

  // 1. Remove fake/placeholder entries (placehold.co URLs)
  const realAssets = assets.filter(
    (a) => a.blobUrl && !a.blobUrl.includes('placehold.co')
  )

  // 2. Deduplicate by id — keep first occurrence (most recent, since we prepend)
  const seen = new Set<string>()
  const deduped = realAssets.filter((a) => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  await kv.set('assets', deduped)

  return NextResponse.json({
    ok: true,
    before,
    after: deduped.length,
    removed: before - deduped.length,
    assets: deduped.map((a) => ({ id: a.id, filename: a.filename, category: a.category })),
  })
}
