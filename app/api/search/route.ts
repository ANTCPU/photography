// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { PLACEHOLDERS } from '@/lib/constants'
import type { PhotoAsset } from '../../dashboard/types'

export const runtime = 'edge'

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim()

  // No query — return platform defaults instead of error
  // Useful for external apps that just want placeholder assets
  if (!q) {
    return NextResponse.json(
      {
        query: '',
        count: 0,
        results: [],
        defaults: {
          profile:   PLACEHOLDERS.profile,
          banner:    PLACEHOLDERS.banner,
          thumbnail: PLACEHOLDERS.thumbnail,
        },
      },
      { status: 200, headers: HEADERS }
    )
  }

  try {
    const assets: PhotoAsset[] = await kv.get('assets') ?? []

    const results = assets.filter(asset =>
      asset.filename.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q) ||
      asset.meta?.toLowerCase().includes(q) ||
      asset.exif?.toLowerCase().includes(q)
    )

    return NextResponse.json(
      {
        query: q,
        count: results.length,
        results: results.slice(0, 12).map(asset => ({
          id:           asset.id,
          filename:     asset.filename,
          title:        asset.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          category:     asset.category,
          status:       asset.status,
          // Always returns a valid image URL — never null
          thumbnailUrl: asset.thumbnailUrl ?? PLACEHOLDERS.thumbnail,
          panel:        asset.category.toLowerCase(),
          priceUsd:     asset.priceUsd,
          antcoin:      asset.antcoin,
        })),
        // Always included — external apps can use these as fallbacks
        defaults: {
          profile:   PLACEHOLDERS.profile,
          banner:    PLACEHOLDERS.banner,
          thumbnail: PLACEHOLDERS.thumbnail,
        },
      },
      { status: 200, headers: HEADERS }
    )

  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: HEADERS }
    )
  }
}
