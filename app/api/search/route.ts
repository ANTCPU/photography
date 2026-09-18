// app/api/search/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Search API
// Reads all assets from KV, filters by query string
// Feeds: dashboard Portfolio, Assets page, Analytics
//
// GET /api/search?q=portrait          — filtered search
// GET /api/search?q=                  — all assets (dashboard "show all")
// GET /api/search?q=&limit=100        — all assets, custom limit (max 200)
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { Redis }                     from '@upstash/redis'
import { PLACEHOLDERS }              from '@/lib/constants'

export const runtime = 'edge'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type':                 'application/json',
}

interface Asset {
  id:           string
  filename:     string
  category:     string
  visibility?:  string
  partner?:     string
  status?:      string
  blobUrl?:     string
  thumbnailUrl?: string
  meta?:        string
  exif?:        string
  priceUsd?:    number | null
  antcoin?:     number | null
  uploadedAt?:  string
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const q      = params.get('q')?.toLowerCase().trim()
  const limit  = Math.min(parseInt(params.get('limit') ?? '50') || 50, 200)

  const defaults = {
    profile:   PLACEHOLDERS.profile,
    banner:    PLACEHOLDERS.banner,
    thumbnail: PLACEHOLDERS.thumbnail,
  }

  try {
    const assets: Asset[] = (await kv.get('assets')) ?? []

    if (!q) {
      // No query — return all assets up to limit
      return NextResponse.json(
        {
          query:   '',
          count:   assets.length,
          results: formatResults(assets.slice(0, limit)),
          defaults,
        },
        { status: 200, headers: HEADERS }
      )
    }

    // Search across filename, category, meta, exif, blobUrl path
    const results = assets.filter(a =>
      a.filename?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.meta?.toLowerCase().includes(q)     ||
      a.exif?.toLowerCase().includes(q)     ||
      a.blobUrl?.toLowerCase().includes(q)
    )

    return NextResponse.json(
      {
        query:   q,
        count:   results.length,
        results: formatResults(results.slice(0, limit)),
        defaults,
      },
      { status: 200, headers: HEADERS }
    )

  } catch (err) {
    console.error('[search] error:', err)
    return NextResponse.json(
      { error: 'Search failed' },  // 🔒 detail removed
      { status: 500, headers: HEADERS }
    )
  }
}

// ── Format ────────────────────────────────────────────────────────────────────
function formatResults(assets: Asset[]) {
  return assets.map(a => ({
    id:           a.id,
    filename:     a.filename,
    title:        a.filename?.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') ?? '',
    category:     a.category,
    visibility:   a.visibility  ?? 'public',   // ← was missing — broke badge rendering
    partner:      a.partner     ?? null,        // ← was missing
    status:       a.status,
    blobUrl:      a.blobUrl      ?? PLACEHOLDERS.thumbnail,
    thumbnailUrl: a.thumbnailUrl ?? PLACEHOLDERS.thumbnail,
    meta:         a.meta         ?? '',
    priceUsd:     a.priceUsd     ?? null,
    antcoin:      a.antcoin      ?? null,
    uploadedAt:   a.uploadedAt,
  }))
}
