// app/api/stats/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Stats API
// Reads KV counters + recent events → feeds dashboard Overview + Analytics
//
// KV keys read:
//   event_count      — total notify events fired (incr on each /api/notify POST)
//   events           — last 50 SiteEvent objects (set on each /api/notify POST)
//   category_counts  — sorted set, category → upload count
//   assets           — full asset list (for total count)
//
// ⚠️  discordConnected — env var presence check only, not a live ping
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server'
import { Redis }        from '@upstash/redis'

const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export const runtime = 'edge'

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET',
  'Content-Type':                 'application/json',
}

// Mirrors SiteEvent shape from lib/discord/types.ts
interface SiteEvent {
  id:        string
  type:      string
  label:     string
  meta:      Record<string, string>
  timestamp: string
}

export async function GET() {
  try {
    const [eventCount, recentEvents, topCategory, assets] = await Promise.all([
      kv.get<number>('event_count'),
      kv.get<SiteEvent[]>('events'),
      kv.zrange('category_counts', 0, 0, { rev: true }),
      kv.get<unknown[]>('assets'),
    ])

    return NextResponse.json(
      {
        status: {
          // ⚠️ env var presence only — not a live Discord ping
          discordConnected: !!process.env.DISCORD_WEBHOOK_URL,
          totalEvents:      eventCount ?? 0,
          totalAssets:      assets?.length ?? 0,
          lastEvent:        (recentEvents ?? [])[0] ?? null,
          topCategory:      topCategory?.[0] ?? null,
        },
        recentEvents: (recentEvents ?? []).slice(0, 10),
      },
      { status: 200, headers: HEADERS }
    )

  } catch (err) {
    console.error('[stats] KV read failed:', err)
    return NextResponse.json(
      {
        status: {
          discordConnected: false,
          totalEvents:      0,
          totalAssets:      0,
          lastEvent:        null,
          topCategory:      null,
        },
        recentEvents: [],
        error: 'Stats unavailable',
      },
      { status: 503, headers: HEADERS }  // was 200 — dashboard now knows it failed
    )
  }
}
