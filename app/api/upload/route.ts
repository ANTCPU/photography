// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'

export const runtime = 'nodejs'

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Auth check ────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  // Check header token (for API clients)
  const headerToken = req.headers.get('x-upload-token')
  if (headerToken && headerToken === process.env.UPLOAD_SECRET) return true

  // Check cookie token (for dashboard browser uploads)
  const cookieToken = req.cookies.get('upload_token')?.value
  if (cookieToken && cookieToken === process.env.UPLOAD_SECRET) return true

  return false
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS })
}

export async function POST(req: NextRequest) {

  // ── Auth gate ───────────────────────────────────────────────────────────────
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — upload token required' },
      { status: 401, headers: HEADERS }
    )
  }

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const category = (formData.get('category') as string) || 'Uncategorized'

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── 1. Upload to Blob ───────────────────────────────────────────────────────
  let blob
  try {
    blob = await put(`assets/${category}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })
  } catch (err) {
    console.error('Blob upload failed:', err)
    return NextResponse.json(
      { error: 'Blob upload failed', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 2. Build metadata ───────────────────────────────────────────────────────
  const asset = {
    id:          crypto.randomUUID(),
    filename:    file.name,
    category,
    status:      'draft',
    blobUrl:     blob.url,
    thumbnailUrl: blob.url,
    priceUsd:    null,
    antcoin:     null,
    meta:        `${(file.size / (1024 * 1024)).toFixed(1)} MB · ${file.type}`,
    exif:        '',
    uploadedAt:  new Date().toISOString(),
  }

  // ── 3. Write to KV ──────────────────────────────────────────────────────────
  try {
    const existing: object[] = (await kv.get('assets')) ?? []
    await kv.set('assets', [asset, ...existing])
  } catch (err) {
    console.error('KV write failed:', err)
    return NextResponse.json(
      { error: 'KV write failed', detail: String(err), blobUrl: blob.url },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 4. Ping Discord ─────────────────────────────────────────────────────────
  try {
    const baseUrl = req.nextUrl.origin
    await fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'upload_complete',
        meta: { filename: file.name, category, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, url: blob.url },
      }),
    })
  } catch (err) {
    console.error('Discord notify failed:', err)
  }

  return NextResponse.json(
    { ok: true, assetId: asset.id, blobUrl: blob.url, filename: file.name },
    { status: 200, headers: HEADERS }
  )
}
