import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET() {
  const testAsset = {
    id: 'test-001',
    filename: 'test_image.jpg',
    category: 'Food',
    status: 'draft',
    blobUrl: 'https://placehold.co/400x400.jpg',
    thumbnailUrl: 'https://placehold.co/400x400.jpg',
    priceUsd: null,
    antcoin: null,
    meta: '1.2 MB · image/jpeg',
    exif: '',
    uploadedAt: new Date().toISOString(),
  };

  try {
    const existing: object[] = (await kv.get('assets')) ?? [];
    await kv.set('assets', [testAsset, ...existing]);
    return NextResponse.json({ ok: true, asset: testAsset });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
