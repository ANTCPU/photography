import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

type EventType =
  | 'gallery_view'
  | 'image_view'
  | 'download_interest'
  | 'print_inquiry'
  | 'cta_click'
  | 'hot_alert'
  | 'referral'
  | 'upload_complete'
  | 'asset_sold';

type SiteEvent = {
  id: string;
  type: EventType;
  label: string;
  meta: Record<string, string>;
  timestamp: string;
};

const EVENT_COLORS: Record<EventType, number> = {
  gallery_view:      0x4da6ff,
  image_view:        0x34d6a8,
  download_interest: 0xb57bff,
  print_inquiry:     0xf5a623,
  cta_click:         0xc8f564,
  hot_alert:         0xff5e5e,
  referral:          0x4da6ff,
  upload_complete:   0x34d6a8,
  asset_sold:        0xc8f564,
};

const EVENT_LABELS: Record<EventType, string> = {
  gallery_view:      '👁️  Gallery View',
  image_view:        '🖼️  Image View',
  download_interest: '💾  Download Interest',
  print_inquiry:     '🎨  Print Inquiry',
  cta_click:         '🔔  CTA Click',
  hot_alert:         '🔥  Hot Alert',
  referral:          '🔗  Referral',
  upload_complete:   '⬆️  Upload Complete',
  asset_sold:        '💰  Asset Sold',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, meta = {} } = body as { type: EventType; meta: Record<string, string> };

    if (!type) {
      return NextResponse.json(
        { error: 'Missing event type' },
        { status: 400, headers: HEADERS }
      );
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'DISCORD_WEBHOOK_URL not configured' },
        { status: 500, headers: HEADERS }
      );
    }

    const event: SiteEvent = {
      id: crypto.randomUUID(),
      type,
      label: EVENT_LABELS[type] ?? type,
      meta,
      timestamp: new Date().toISOString(),
    };

    // Post to Discord
    const fields = Object.entries(meta).map(([name, value]) => ({
      name,
      value: String(value),
      inline: true,
    }));

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: event.label,
          color: EVENT_COLORS[type] ?? 0x7c8096,
          fields: fields.length ? fields : undefined,
          footer: { text: 'Amanda Platform · amandaland.vercel.app' },
          timestamp: event.timestamp,
        }],
      }),
    });

    // Write to KV
    const existing: SiteEvent[] = (await kv.get('events')) ?? [];
    await kv.set('events', [event, ...existing].slice(0, 50));
    await kv.incr('event_count');
    if (meta.category) {
      await kv.zincrby('category_counts', 1, meta.category);
    }

    return NextResponse.json(
      { ok: true, eventId: event.id },
      { status: 200, headers: HEADERS }
    );

  } catch (err) {
    console.error('Notify error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500, headers: HEADERS }
    );
  }
}
