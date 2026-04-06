import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { PhotoAsset } from '../../dashboard/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();

  if (!q) {
    return NextResponse.json(
      { error: 'No query provided' },
      { status: 400, headers }
    );
  }

  try {
    const assets: PhotoAsset[] = await kv.get('assets') ?? [];

    const results = assets.filter(asset =>
      asset.filename.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q) ||
      asset.meta?.toLowerCase().includes(q) ||
      asset.exif?.toLowerCase().includes(q)
    );

    return NextResponse.json(
      {
        query: q,
        count: results.length,
        results: results.slice(0, 12).map(asset => ({
          id: asset.id,
          filename: asset.filename,
          title: asset.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          category: asset.category,
          status: asset.status,
          thumbnailUrl: asset.thumbnailUrl ?? `https://antcpu.com/manda/images/${asset.filename}`,
          panel: asset.category.toLowerCase(),
          priceUsd: asset.priceUsd,
          antcoin: asset.antcoin,
        }))
      },
      { status: 200, headers }
    );

  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers }
    );
  }
}
