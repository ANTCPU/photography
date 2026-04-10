import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const assets = (await kv.get<object[]>('assets')) ?? [];
    return NextResponse.json(
      { count: assets.length, assets },
      { status: 200, headers: HEADERS }
    );
  } catch (err) {
    console.error('Assets fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch assets', detail: String(err) },
      { status: 500, headers: HEADERS }
    );
  }
}
