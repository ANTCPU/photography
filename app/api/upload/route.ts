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
import { put } from '@vercel/blob'
import { Redis } from '@upstash/redis'
import cloudinary, { thumbUrl } from '@/lib/cloudinary'
import { CLOUDINARY } from '@/lib/constants'

export const runtime = 'nodejs'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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
  // visibility: private | partner | public — default private
  const visibility = (formData.get('visibility') as string) || 'private'
  // partner: optional — 'mapofpi' | 'wedding' | null
  const partner    = (formData.get('partner')   as string) || null

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400, headers: HEADERS }
    )
  }

  // Validate visibility value
  const VALID_VISIBILITY = ['private', 'partner', 'public']
  if (!VALID_VISIBILITY.includes(visibility)) {
    return NextResponse.json(
      { error: `Invalid visibility. Valid: ${VALID_VISIBILITY.join(', ')}` },
      { status: 400, headers: HEADERS }
    )
  }

  // ── 1. Vercel Blob — source of truth ────────────────────────────────────────
  let blob
  try {
    blob = await put(`assets/${category}/${file.name}`, file, {
      access:            'public',
      addRandomSuffix:   false,
    })
  } catch (err) {
    console.error('Blob upload failed:', err)
    return NextResponse.json(
      { error: 'Blob upload failed', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 2. Cloudinary — delivery layer ──────────────────────────────────────────
  let cloudinaryId = ''
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)
    const publicId    = file.name.replace(/\.[^/.]+$/, '')

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:        `${CLOUDINARY.folder}/${category}`,
          public_id:     publicId,
          overwrite:     true,
          resource_type: 'image',
        },
        (err, res) => (err ? reject(err) : resolve(res))
      ).end(buffer)
    })

    cloudinaryId = result.public_id
    console.log('Cloudinary upload ok:', cloudinaryId)
  } catch (err) {
    console.error('Cloudinary upload failed (non-fatal):', err)
  }

  // ── 3. Build metadata ────────────────────────────────────────────────────────
  const asset = {
    id:           crypto.randomUUID(),
    filename:     file.name,
    category,
    // Visibility — private by default, released manually
    visibility,
    partner:      partner || null,
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

  // ── 4. Write to KV ───────────────────────────────────────────────────────────
  try {
    const existing: any[] = (await kv.get('assets')) ?? []
    const filtered = existing.filter(
      (a) => !(a.filename === file.name && a.category === category)
    )
    await kv.set('assets', [asset, ...filtered])
  } catch (err) {
    console.error('KV write failed:', err)
    return NextResponse.json(
      { error: 'KV write failed', detail: String(err), blobUrl: blob.url },
      { status: 500, headers: HEADERS }
    )
  }

  // ── 5. Ping Discord ──────────────────────────────────────────────────────────
  try {
    const baseUrl = req.nextUrl.origin
    await fetch(`${baseUrl}/api/notify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'upload_complete',
        meta: {
          filename:    file.name,
          category,
          visibility,
          partner:     partner || 'none',
          size:        `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url:         blob.url,
          cloudinaryId: cloudinaryId || 'not uploaded',
        },
      }),
    })
  } catch (err) {
    console.error('Discord notify failed:', err)
  }

  return NextResponse.json(
    {
      ok:           true,
      assetId:      asset.id,
      blobUrl:      blob.url,
      cloudinaryId,
      thumbnailUrl: asset.thumbnailUrl,
      filename:     file.name,
      visibility,
      partner:      partner || null,
    },
    { status: 200, headers: HEADERS }
  )
}
