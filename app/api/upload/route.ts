// app/api/upload/route.ts
// Receives file from UploadZone → stores in Vercel Blob
// → writes metadata to KV → pings Discord via /api/notify

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

// NOTE: Must NOT use edge runtime — Blob requires Node.js runtime
export const runtime = 'nodejs';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'Uncategorized';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: HEADERS }
      );
    }

    // ── 1. Upload file to Vercel Blob ──────────────────────────────────────
    const blob = await put(`assets/${category}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // ── 2. Build asset metadata ────────────────────────────────────────────
    const asset = {
      id: crypto.randomUUID(),
      filename: file.name,
      category,
      status: 'draft',
      blobUrl: blob.url,
      thumbnailUrl: blob.url,
      priceUsd: null,
      antcoin: null,
      meta: `${(file.size / (1024 * 1024)).toFixed(1)} MB · ${file.type}`,
      exif: '',
      uploadedAt: new Date().toISOString(),
    };

    // ── 3. Write metadata to KV ────────────────────────────────────────────
    // Append to assets array (used by /api/search)
    const existing: object[] = (await kv.get('assets')) ?? [];
    await kv.set('assets', [asset, ...existing]);

    // ── 4. Ping Discord via /api/notify ────────────────────────────────────
    const baseUrl = req.nextUrl.origin;
    await fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'upload_complete',
        meta: {
          filename: file.name,
          category,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: blob.url,
        },
      }),
    });

    return NextResponse.json(
      {
        ok: true,
        assetId: asset.id,
        blobUrl: blob.url,
        filename: file.name,
      },
      { status: 200, headers: HEADERS }
    );

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500, headers: HEADERS }
    );
  }
}
