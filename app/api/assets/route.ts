// app/api/assets/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Assets API
//
// Visibility filtering:
//   No auth, no params  → public assets only (visibility: 'public' or missing)
//   ?partner=mapofpi    → public + partner assets (requires x-partner-key header)
//   ?visibility=all     → all assets (requires upload_token cookie — dashboard)
//
// Legacy assets (no visibility field) are treated as 'public' — backwards compat.
//
// Partner keys: set PARTNER_KEYS env var as JSON
//   e.g. {"mapofpi":"key_abc123","wedding":"key_xyz789"}
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { PLACEHOLDERS, PLATFORM } from '@/lib/constants'

export const runtime = 'edge'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type':                 'application/json',
  // Cache public responses — private/partner responses must not be cached
  'Cache-Control':                'no-store',
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

function isDashboardAuth(req: NextRequest): boolean {
  const headerToken = req.headers.get('x-upload-token')
  if (headerToken && headerToken === process.env.UPLOAD_SECRET) return true
  const cookieToken = req.cookies.get('upload_token')?.value
  if (cookieToken && cookieToken === process.env.UPLOAD_SECRET) return true
  return false
}

function getPartnerKeys(): Record<string, string> {
  try {
    return JSON.parse(process.env.PARTNER_KEYS || '{}')
  } catch {
    return {}
  }
}

function isValidPartnerKey(partner: string, key: string | null): boolean {
  if (!key) return false
  const keys = getPartnerKeys()
  return keys[partner] === key
}

// ── Visibility resolver ───────────────────────────────────────────────────────
// Legacy assets have no visibility field — treat as 'public'
function resolveVisibility(asset: any): string {
  return asset.visibility || 'public'
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const partnerParam  = searchParams.get('partner')   // e.g. 'mapofpi'
    const visibilityAll = searchParams.get('visibility') === 'all'
    const categoryParam = searchParams.get('category')  // optional filter

    const allAssets = ((await kv.get('assets')) ?? []) as any[]

    let filtered: any[]

    // ── Case 1: Dashboard — full view, auth required ──────────────────────────
    if (visibilityAll) {
      if (!isDashboardAuth(req)) {
        return NextResponse.json(
          { error: 'Unauthorized — dashboard auth required for full asset view' },
          { status: 401, headers: HEADERS }
        )
      }
      filtered = allAssets
    }

    // ── Case 2: Partner — public + their private assets, key required ─────────
    else if (partnerParam) {
      const partnerKey = req.headers.get('x-partner-key')
      if (!isValidPartnerKey(partnerParam, partnerKey)) {
        return NextResponse.json(
          { error: 'Invalid or missing partner key' },
          { status: 403, headers: HEADERS }
        )
      }
      filtered = allAssets.filter(a => {
        const v = resolveVisibility(a)
        return v === 'public' || (v === 'partner' && a.partner === partnerParam)
      })
    }

    // ── Case 3: Public — default, no auth needed ──────────────────────────────
    else {
      filtered = allAssets.filter(a => resolveVisibility(a) === 'public')
    }

    // ── Optional category filter ──────────────────────────────────────────────
    if (categoryParam) {
      filtered = filtered.filter(
        a => a.category?.toLowerCase() === categoryParam.toLowerCase()
      )
    }

    // ── Strip sensitive fields from non-dashboard responses ───────────────────
    const sanitized = visibilityAll
      ? filtered  // dashboard sees everything
      : filtered.map(({ blobUrl: _b, ...rest }) => rest) // hide raw blob URLs

    return NextResponse.json(
      {
        platform: {
          name:       PLATFORM.name,
          baseUrl:    PLATFORM.baseUrl,
          publicSite: PLATFORM.publicSite,
        },
        defaults: {
          profile:   PLACEHOLDERS.profile,
          banner:    PLACEHOLDERS.banner,
          thumbnail: PLACEHOLDERS.thumbnail,
        },
        count:  sanitized.length,
        assets: sanitized,
        // Meta — helps callers understand what they received
        _meta: {
          filter:  visibilityAll ? 'all' : partnerParam ? `partner:${partnerParam}` : 'public',
          category: categoryParam || null,
        },
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
