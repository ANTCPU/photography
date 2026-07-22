// app/api/notify/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Notify API
// HTTP layer only — all visual logic lives in lib/discord/
// Validates event → builds embed → fires Discord → writes KV
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { buildEmbed } from '@/lib/discord'
import type { EventType, SiteEvent } from '@/lib/discord'

// ── KV client ─────────────────────────────────────────────────────────────────
const kv = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export const runtime = 'edge'

// ── CORS — allow agent (antcpu.com) and studio (amandaland.vercel.app) ────────
const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, meta = {} } = body as {
      type: EventType
      meta: Record<string, string>
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400, headers: HEADERS }
      )
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'DISCORD_WEBHOOK_URL not configured' },
        { status: 500, headers: HEADERS }
      )
    }

    // ── Build event ───────────────────────────────────────────────────────────
    const event: SiteEvent = {
      id:        crypto.randomUUID(),
      type,
      label:     type.replace(/_/g, ' '),
      meta,
      timestamp: new Date().toISOString(),
    }

    // ── Build visual embed — all logic in lib/discord/embeds.ts ──────────────
    const embed = buildEmbed(event)

    // ── Fire Discord + write KV in parallel ───────────────────────────────────
    await Promise.all([

      // Discord webhook
      fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ embeds: [embed] }),
      }),

      // KV writes
      (async () => {
        const existing: SiteEvent[] = (await kv.get('events')) ?? []
        await kv.set('events', [event, ...existing].slice(0, 50))
        await kv.incr('event_count')
        if (meta.category)             await kv.zincrby('category_counts', 1, meta.category)
        if (type === 'booking_inquiry') await kv.incr('booking_count')
        if (type === 'asset_sold')      await kv.incr('sales_count')
      })(),

    ])

    return NextResponse.json(
      { ok: true, eventId: event.id, type, label: event.label },
      { status: 200, headers: HEADERS }
    )

  } catch (err) {
    console.error('[notify] error:', err)
    return NextResponse.json(
      { error: 'Internal error', detail: String(err) },
      { status: 500, headers: HEADERS }
    )
  }
}
