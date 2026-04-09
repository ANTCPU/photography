import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { PhotoAsset } from '../../dashboard/types';

export const runtime = 'edge';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const assets: PhotoAsset[] = (await kv.get('assets')) ?? [];
    return NextResponse.json(
      { count: assets.length, assets },
      { status: 200, headers: HEADERS }
    );
  } catch (err) {
    console.error('Assets fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500, headers: HEADERS }
    );
  }
}
