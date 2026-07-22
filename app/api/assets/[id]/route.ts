// app/api/assets/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Asset management by ID
//
// PATCH /api/assets/[id]  — update visibility, partner, status
//   Body: { visibility?: 'private'|'partner'|'public', partner?: string, status?: string }
//   Auth: upload_token cookie or x-upload-token header (dashboard only)
//
// DELETE /api/assets/[id] — remove asset from KV (does not delete from Blob/Cloudinary)
//   Auth: upload_token cookie or x-upload-token header (dashboard only)
//
// Use cases:
//   Release private → public:  PATCH { visibility: 'public' }
//   Assign to partner:         PATCH { visibility: 'partner', partner: 'mapofpi' }
//   Soft delete:               DELETE
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
  'Content-Type':                 'application/json',
  'Cache-Control':                'no-store',
}

const VALID_VISIBILITY = ['private', 'partner', 'public'] as const
type Visibility = typeof VALID_VISIBILITY[number]

// ── Auth ──────────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const headerToken = req.headers.get('x-upload-token')
  if (headerToken && headerToken === process.env.UPLOAD_SECRET) return true
  const cookieToken = req.cookies.get('upload_token')?.value
  if (cookieToken && cookieToken === process.env.UPLOAD_SECRET) return true
  return false
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS })
}

// ── PATCH — update asset visibility / partner / status ────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: HEADERS }
    )
  }

  const { id } = params
  if (!id) {
    return NextResponse.json(
      { error: 'Missing asset id' },
      { status: 400, headers: HEADERS }
    )
  }

  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: HEADERS }
    )
  }

  const { visibility, partner, status } = body

  // Validate visibility if provided
  if (visibility && !VALID_VISIBILITY.includes(visibility as Visibility)) {
    return NextResponse.json(
      { error: `Invalid visibility. Valid: ${VALID_VISIBILITY.join(', ')}` },
      { status: 400, headers: HEADERS }
    )
  }

  // Partner required when visibility is 'partner'
  if (visibility === 'partner' && !partner) {
    return NextResponse.json(
      { error: 'partner field required when visibility is partner' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Read + update KV ────────────────────────────────────────────────────────
  const assets: any[] = (await kv.get('assets')) ?? []
  const idx = assets.findIndex(a => a.id === id)

  if (idx === -1) {
    return NextResponse.json(
      { error: `Asset not found: ${id}` },
      { status: 404, headers: HEADERS }
    )
  }

  const existing = assets[idx]
  const now      = new Date().toISOString()

  // Build the update — only apply fields that were provided
  const updated = {
    ...existing,
    ...(visibility !== undefined && {
      visibility,
      // Set releasedAt when going public for the first time
      releasedAt: visibility === 'public' && !existing.releasedAt ? now : existing.releasedAt,
      // Clear releasedAt if pulled back to private
      ...(visibility === 'private' && { releasedAt: null }),
    }),
    ...(partner  !== undefined && { partner:  partner  || null }),
    ...(status   !== undefined && { status }),
    updatedAt: now,
  }

  assets[idx] = updated
  await kv.set('assets', assets)

  return NextResponse.json(
    {
      ok:      true,
      id,
      updated: {
        visibility: updated.visibility,
        partner:    updated.partner,
        status:     updated.status,
        releasedAt: updated.releasedAt,
        updatedAt:  updated.updatedAt,
      },
    },
    { status: 200, headers: HEADERS }
  )
}

// ── DELETE — remove asset from KV ─────────────────────────────────────────────
// Note: does NOT delete from Vercel Blob or Cloudinary
// Blob deletion requires the Vercel Blob SDK del() — add if needed
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: HEADERS }
    )
  }

  const { id } = params
  if (!id) {
    return NextResponse.json(
      { error: 'Missing asset id' },
      { status: 400, headers: HEADERS }
    )
  }

  const assets: any[] = (await kv.get('assets')) ?? []
  const idx = assets.findIndex(a => a.id === id)

  if (idx === -1) {
    return NextResponse.json(
      { error: `Asset not found: ${id}` },
      { status: 404, headers: HEADERS }
    )
  }

  const removed = assets[idx]
  assets.splice(idx, 1)
  await kv.set('assets', assets)

  return NextResponse.json(
    {
      ok:      true,
      id,
      removed: {
        filename:   removed.filename,
        category:   removed.category,
        visibility: removed.visibility || 'public',
      },
    },
    { status: 200, headers: HEADERS }
  )
}
