import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const [eventCount, recentEvents, topCategory] = await Promise.all([
      kv.get<number>('event_count'),
      kv.get<object[]>('events'),
      kv.zrange('category_counts', 0, 0, { rev: true }),
    ]);

    return NextResponse.json(
      {
        status: {
          discordConnected: !!process.env.DISCORD_WEBHOOK_URL,
          totalEvents: eventCount ?? 0,
          lastEvent: (recentEvents ?? [])[0] ?? null,
          topCategory: topCategory?.[0] ?? null,
        },
        recentEvents: (recentEvents ?? []).slice(0, 10),
      },
      { status: 200, headers: HEADERS }
    );

  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json(
      {
        status: {
          discordConnected: false,
          totalEvents: 0,
          lastEvent: null,
          topCategory: null,
        },
        recentEvents: [],
      },
      { status: 200, headers: HEADERS }
    );
  }
}
