import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

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
    const existing = (await kv.get<object[]>('assets')) ?? [];
    await kv.set('assets', [testAsset, ...existing]);
    return NextResponse.json({ ok: true, asset: testAsset });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
