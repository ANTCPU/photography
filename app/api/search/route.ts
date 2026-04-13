// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { PLACEHOLDERS } from '@/lib/constants'

export const runtime = 'edge'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim()

  const defaults = {
    profile:   PLACEHOLDERS.profile,
    banner:    PLACEHOLDERS.banner,
    thumbnail: PLACEHOLDERS.thumbnail,
  }

  try {
    const assets: any[] = (await kv.get('assets')) ?? []

    // No query — return all assets (useful for dashboard "show all")
    if (!q) {
      return NextResponse.json(
        {
          query:    '',
          count:    assets.length,
          results:  formatResults(assets),
          defaults,
        },
        { status: 200, headers: HEADERS }
      )
    }

    // Search across filename, category, meta, exif, and blobUrl path
    const results = assets.filter((asset) =>
      asset.filename?.toLowerCase().includes(q)   ||
      asset.category?.toLowerCase().includes(q)   ||
      asset.meta?.toLowerCase().includes(q)        ||
      asset.exif?.toLowerCase().includes(q)        ||
      asset.blobUrl?.toLowerCase().includes(q)
    )

    return NextResponse.json(
      {
        query:    q,
        count:    results.length,
        results:  formatResults(results.slice(0, 20)),
        defaults,
      },
      { status: 200, headers: HEADERS }
    )

  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json(
      { error: 'Search failed', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatResults(assets: any[]) {
  return assets.map((asset) => ({
    id:           asset.id,
    filename:     asset.filename,
    title:        asset.filename?.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') ?? '',
    category:     asset.category,
    status:       asset.status,
    blobUrl:      asset.blobUrl      ?? PLACEHOLDERS.thumbnail,
    thumbnailUrl: asset.thumbnailUrl ?? PLACEHOLDERS.thumbnail,
    meta:         asset.meta         ?? '',
    priceUsd:     asset.priceUsd,
    antcoin:      asset.antcoin,
    uploadedAt:   asset.uploadedAt,
  }))
}
