// app/api/resize/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Image Resize API
// Accepts an image + target dimensions, returns resized image via Sharp
// Used by: /studio page, Amanda agent ("resize this for Instagram")
// Auth: same UPLOAD_SECRET token as /api/upload
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { SOCIAL_SIZES } from '@/lib/constants'

// ── Node runtime — Sharp requires Node, not Edge ──────────────────────────────
export const runtime = 'nodejs'

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-upload-token',
}

// ── Max input file size — 20MB ────────────────────────────────────────────────
const MAX_BYTES = 20 * 1024 * 1024

// ── Auth — matches upload route pattern ──────────────────────────────────────
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

// ── POST /api/resize ──────────────────────────────────────────────────────────
// Body: multipart/form-data
//   file     — image file (required)
//   w        — target width in px (required unless platform+format provided)
//   h        — target height in px (required unless platform+format provided)
//   platform — e.g. "instagram" (optional — resolves w/h from SOCIAL_SIZES)
//   format   — e.g. "postSquare" (optional — used with platform)
//   fit      — "cover" | "contain" | "fill" | "inside" | "outside" (default: cover)
//   quality  — 1-100 (default: 90)
//   output   — "jpeg" | "png" | "webp" (default: webp)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — upload token required' },
      { status: 401, headers: HEADERS }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400, headers: HEADERS }
    )
  }

  const file     = formData.get('file')     as File   | null
  const platform = formData.get('platform') as string | null
  const format   = formData.get('format')   as string | null
  const fit      = (formData.get('fit')     as string | null) ?? 'cover'
  const quality  = parseInt(formData.get('quality') as string ?? '90', 10)
  const output   = (formData.get('output')  as string | null) ?? 'webp'

  // ── Validate file ─────────────────────────────────────────────────────────
  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400, headers: HEADERS }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large — max ${MAX_BYTES / 1024 / 1024}MB` },
      { status: 413, headers: HEADERS }
    )
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'File must be an image' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Resolve dimensions ────────────────────────────────────────────────────
  // Priority: explicit w/h → platform+format lookup → error
  let w: number | null = null
  let h: number | null = null

  if (platform && format) {
    // Look up from SOCIAL_SIZES in lib/constants.ts
    const platformSizes = SOCIAL_SIZES[platform as keyof typeof SOCIAL_SIZES]
    if (!platformSizes) {
      return NextResponse.json(
        { error: `Unknown platform: ${platform}. Valid: ${Object.keys(SOCIAL_SIZES).join(', ')}` },
        { status: 400, headers: HEADERS }
      )
    }
    const dims = platformSizes[format as keyof typeof platformSizes] as { w: number; h: number } | undefined
    if (!dims) {
      return NextResponse.json(
        { error: `Unknown format: ${format} for ${platform}. Valid: ${Object.keys(platformSizes).join(', ')}` },
        { status: 400, headers: HEADERS }
      )
    }
    w = dims.w
    h = dims.h
  } else {
    w = parseInt(formData.get('w') as string ?? '', 10)
    h = parseInt(formData.get('h') as string ?? '', 10)
  }

  if (!w || !h || isNaN(w) || isNaN(h) || w < 1 || h < 1) {
    return NextResponse.json(
      { error: 'Provide w + h dimensions, or platform + format' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Cap dimensions — prevent abuse ───────────────────────────────────────
  if (w > 4096 || h > 4096) {
    return NextResponse.json(
      { error: 'Max dimension is 4096px' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Validate fit ──────────────────────────────────────────────────────────
  const validFits = ['cover', 'contain', 'fill', 'inside', 'outside']
  if (!validFits.includes(fit)) {
    return NextResponse.json(
      { error: `Invalid fit. Valid: ${validFits.join(', ')}` },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Validate output format ────────────────────────────────────────────────
  const validOutputs = ['jpeg', 'png', 'webp']
  if (!validOutputs.includes(output)) {
    return NextResponse.json(
      { error: `Invalid output format. Valid: ${validOutputs.join(', ')}` },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Process with Sharp ────────────────────────────────────────────────────
  let resized: Buffer
  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    let pipeline = sharp(buffer)
      .resize(w, h, {
        fit:        fit as keyof sharp.FitEnum,
        position:   'attention', // Smart crop — focuses on salient region
        withoutEnlargement: false,
      })

    // Apply output format + quality
    if (output === 'webp') {
      pipeline = pipeline.webp({ quality })
    } else if (output === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
    } else if (output === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9 })
    }

    resized = await pipeline.toBuffer()
  } catch (err) {
    console.error('[resize] Sharp error:', err)
    return NextResponse.json(
      { error: 'Resize failed', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }

  // ── Return resized image as binary ────────────────────────────────────────
  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png:  'image/png',
  }

  const ext      = output === 'jpeg' ? 'jpg' : output
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const filename = `${baseName}_${w}x${h}.${ext}`

  return new NextResponse(resized, {
    status: 200,
    headers: {
      ...HEADERS,
      'Content-Type':        mimeTypes[output],
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(resized.byteLength),
      'X-Resize-Width':      String(w),
      'X-Resize-Height':     String(h),
      'X-Resize-Format':     output,
      'X-Original-Size':     String(file.size),
      'X-Resized-Size':      String(resized.byteLength),
    },
  })
}
