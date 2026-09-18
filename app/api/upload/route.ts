// app/api/upload/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Upload API
// Dual storage: Vercel Blob (source) + Cloudinary (delivery)
// Auth: upload_token cookie (studio login) or x-upload-token header
//
// Asset visibility model:
//   private  — staging only, dashboard auth required to view
//   partner  — visible to named partner via x-partner-key header
//   public   — visible to everyone via /api/assets
//
// Default on upload: private
// Release: PATCH /api/assets/[id] sets visibility → public
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { put }                       from '@vercel/blob'
import { Redis }                     from '@upstash/redis'
import cloudinary, { thumbUrl }      from '@/lib/cloudinary'
import { CLOUDINARY }                from '@/lib/constants'

export const runtime = 'nodejs'  // Buffer + Cloudinary SDK — cannot be edge

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Asset type ────────────────────────────────────────────────────────────────
interface Asset {
  id:           string
  filename:     string
  category:     string
  visibility:   string
  partner:      string | null
  releasedAt:   string | null
  status:       string
  blobUrl:      string
  cloudinaryId: string
  thumbnailUrl: string
  priceUsd:     null
  antcoin:      null
  meta:         string
  exif:         string
  uploadedAt:   string
}

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

export async function POST(req: NextRequest) {

  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — upload token required' },
      { status: 401, headers: HEADERS }
    )
  }

  const formData   = await req.formData()
  const file       = formData.get('file')       as File   | null
  const category   = (formData.get('category')  as string) || 'Uncategorized'
  const visibility = (formData.get('visibility') as string) || 'private'

  // Guard against 'null' string sent from FormData
  const partnerRaw = formData.get('partner') as string | null
  const partner    = (partnerRaw && partnerRaw !== 'null') ? partnerRaw : null

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400, headers: HEADERS }
    )
  }

  const VALID_VISIBILITY = ['private', 'partner', 'public']
  if (!VALID_VISIBILITY.includes(visibility)) {
    return NextResponse.json(
      { error: `Invalid visibility. Valid: ${VALID_VISIBILITY.join(', ')}` },
      { status: 400, headers: HEADERS }
    )
  }

  // ── 1. Vercel Blob ────────────────────────────────────────────────────────
  let blob
  try {
    blob = await put(`assets/${category}/${file.name}`, file, {
      access:          'public',
      addRandomSuffix: false,
    })
  } catch (err) {
    console.error('[upload] Blob failed:', err)
    return NextResponse.json(
      { error: 'Blob upload failed' },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 2. Cloudinary ─────────────────────────────────────────────────────────
  let cloudinaryId = ''
  let cloudinaryOk = false
  try {
    const buffer   = Buffer.from(await file.arrayBuffer())
    const publicId = file.name.replace(/\.[^/.]+$/, '')

    const result = await new Promise<{ public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:        `${CLOUDINARY.folder}/${category}`,
          public_id:     publicId,
          overwrite:     true,
          resource_type: 'auto',
        },
        (err, res) => (err ? reject(err) : resolve(res!))
      ).end(buffer)
    })

    cloudinaryId = result.public_id
    cloudinaryOk = true
    console.log('[upload] Cloudinary ok:', cloudinaryId)
  } catch (err) {
    // Non-fatal — blob is source of truth, but alert via Discord
    console.error('[upload] Cloudinary failed (non-fatal):', err)

    // Fire-and-forget Discord alert — goes to DISCORD_WEBHOOK_URL via /api/notify
    fetch(`${req.nextUrl.origin}/api/notify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cloudinary_error',
        meta: {
          filename: file.name,
          category,
          error:    String(err).slice(0, 200),
        },
      }),
    }).catch(() => {})
  }

  // ── 3. Build asset ────────────────────────────────────────────────────────
  const asset: Asset = {
    id:           crypto.randomUUID(),
    filename:     file.name,
    category,
    visibility,
    partner,
    releasedAt:   visibility === 'public' ? new Date().toISOString() : null,
    status:       'draft',
    blobUrl:      blob.url,
    cloudinaryId,
    thumbnailUrl: cloudinaryId ? thumbUrl(cloudinaryId) : blob.url,
    priceUsd:     null,
    antcoin:      null,
    meta:         `${(file.size / (1024 * 1024)).toFixed(1)} MB · ${file.type}`,
    exif:         '',
    uploadedAt:   new Date().toISOString(),
  }

  // ── 4. Write to KV ────────────────────────────────────────────────────────
  try {
    const existing: Asset[] = (await kv.get('assets')) ?? []
    const dupeIndex = existing.findIndex(
      a => a.filename === file.name && a.category === category
    )
    if (dupeIndex !== -1) {
      console.log('[upload] replacing existing asset:', file.name, category)
      existing.splice(dupeIndex, 1)
    }
    await kv.set('assets', [asset, ...existing])
  } catch (err) {
    console.error('[upload] KV write failed:', err)
    return NextResponse.json(
      { error: 'KV write failed', blobUrl: blob.url },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 5. Discord notify ─────────────────────────────────────────────────────
  fetch(`${req.nextUrl.origin}/api/notify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'upload_complete',
      meta: {
        filename:     file.name,
        category,
        visibility,
        partner:      partner || 'none',
        size:         `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url:          blob.url,
        cloudinaryId: cloudinaryId || 'failed',
        cloudinary:   cloudinaryOk ? '✅' : '❌ failed — blob fallback',
      },
    }),
  }).catch(() => {})

  return NextResponse.json(
    {
      ok:           true,
      assetId:      asset.id,
      blobUrl:      blob.url,
      cloudinaryId,
      thumbnailUrl: asset.thumbnailUrl,
      filename:     file.name,
      visibility,
      partner,
    },
    { status: 200, headers: HEADERS }
  )
}
