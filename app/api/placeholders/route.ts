// app/api/placeholders/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CONFIGS = {
  profile:   { w: 400,  h: 400,  label: 'Amanda Photography' },
  banner:    { w: 1500, h: 500,  label: 'Amanda Photography' },
  thumbnail: { w: 400,  h: 400,  label: 'Amanda Photography' },
}

function makeSVG(w: number, h: number, label: string): string {
  const fs  = Math.round(Math.min(w, h) * 0.07)
  const sub = Math.round(fs * 0.5)
  const cx  = Math.round(w / 2)
  const cy  = Math.round(h / 2)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="#12151c"/>`,
    `<rect width="${w}" height="${h}" fill="none" stroke="rgba(200,245,100,0.15)" stroke-width="2"/>`,
    `<text x="${cx}" y="${cy - sub}" font-family="monospace" font-size="${fs}" font-weight="700" fill="#c8f564" text-anchor="middle" dominant-baseline="middle">A</text>`,
    `<text x="${cx}" y="${cy + fs * 0.8}" font-family="monospace" font-size="${sub}" fill="#4a4f63" text-anchor="middle">${label}</text>`,
    `<text x="${cx}" y="${cy + fs * 1.5}" font-family="monospace" font-size="${Math.round(sub * 0.85)}" fill="#2a2f3d" text-anchor="middle">${w} x ${h}</text>`,
    `</svg>`,
  ].join('\n')
}

export async function GET(req: NextRequest) {
  const type   = req.nextUrl.searchParams.get('type') ?? 'profile'
  const config = CONFIGS[type as keyof typeof CONFIGS] ?? CONFIGS.profile
  const svg    = makeSVG(config.w, config.h, config.label)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type':                'image/svg+xml',
      'Cache-Control':               'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
