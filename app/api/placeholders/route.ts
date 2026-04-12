// app/api/placeholders/route.ts
// Generates placeholder images as SVG→PNG on the fly
// No binary files needed in the repo

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function makeSVG(w: number, h: number, label: string): string {
  const fontSize = Math.min(w, h) * 0.08
  const subSize  = fontSize * 0.5
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#0b0d11"/>
    <rect x="1" y="1" width="${w-2}" height="${h-2}" fill="none" stroke="#c8f564" stroke-width="1" stroke-opacity="0.2"/>
    <text x="${w/2}" y="${h/2 - fontSize*0.6}" 
      font-family="monospace" font-size="${fontSize}" font-weight="bold"
      fill="#c8f564" text-anchor="middle" dominant-baseline="middle">A</text>
    <text x="${w/2}" y="${h/2 + fontSize*0.8}" 
      font-family="monospace" font-size="${subSize}"
      fill="#4a4f63" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="${w/2}" y="${h - subSize}" 
      font-family="monospace" font-size="${subSize * 0.8}"
      fill="#4a4f63" text-anchor="middle" dominant-baseline="middle">${w} × ${h}</text>
  </svg>`
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'profile'

  const configs: Record<string, { w: number; h: number; label: string }> = {
    profile:   { w: 400,  h: 400,  label: 'Amanda Photography' },
    banner:    { w: 1500, h: 500,  label: 'Amanda Photography' },
    thumbnail: { w: 400,  h: 400,  label: 'Amanda Photography' },
  }

  const config = configs[type] ?? configs.profile
  const svg = makeSVG(config.w, config.h, config.label)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
