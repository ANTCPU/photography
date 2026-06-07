// app/api/admin/migrate-cloudinary/route.ts
// One-time backfill — uploads existing Blob assets to Cloudinary and updates KV
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import cloudinary, { thumbUrl } from '@/lib/cloudinary'
import { CLOUDINARY } from '@/lib/constants'

export const runtime = 'nodejs'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(req: NextRequest) {
  const adminToken = req.headers.get('x-admin-token')
  if (adminToken !== process.env.UPLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assets: any[] = (await kv.get('assets')) ?? []
  const results: any[] = []

  for (const asset of assets) {
    // Skip already migrated
    if (asset.cloudinaryId) {
      results.push({ filename: asset.filename, status: 'skipped — already has cloudinaryId' })
      continue
    }

    try {
      // Fetch from Blob
      const res = await fetch(asset.blobUrl)
      if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      const publicId = asset.filename.replace(/\.[^/.]+$/, '')

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder:        `${CLOUDINARY.folder}/${asset.category}`,
            public_id:     publicId,
            overwrite:     true,
            resource_type: 'image',
          },
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer)
      })

      // Update asset in place
      asset.cloudinaryId  = result.public_id
      asset.thumbnailUrl  = thumbUrl(result.public_id)

      results.push({ filename: asset.filename, status: 'migrated', cloudinaryId: result.public_id })
    } catch (err) {
      results.push({ filename: asset.filename, status: 'failed', error: String(err) })
    }
  }

  // Write updated assets back to KV
  await kv.set('assets', assets)

  return NextResponse.json({ ok: true, migrated: results.filter(r => r.status === 'migrated').length, results })
}
