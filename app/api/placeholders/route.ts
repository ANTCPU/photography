// app/api/placeholders/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function makeSVG(w: number, h: number, label: string): string {
  const fs  = Math.round(Math.min(w, h) * 0.08)
  const sub = Math.round(fs * 0.5)
  const cx  = Math.round(w / 2)
  const cy  = Math.round(h / 2)

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '  width="' + w + '" height="' + h + '"',
    '  viewBox="0 0 ' + w + ' ' + h + '">',
    '<rect width="' + w + '" height="' + h + '" fill="#0b0d11"/>',
    '<rect x="2" y="2"',
    '  width="' + (w - 4) + '" height="' + (h - 4) + '"',
    '  fill="none" stroke="#c8f564" stroke-width="1" stroke-opacity="0.15"/>',
    '<text x="' + cx + '" y="' + (cy - fs) + '"',
    '  font-family="monospace" font-size="' + fs + '" font-weight="bold"',
    '  fill="#c8f564" text-anchor="middle" dominant-baseline="middle">A</text>',
    '<text x="' + cx + '" y="' + (cy + Math.round(fs * 0.4)) + '"',
    '  font-family="monospace" font-size="' + sub + '"',
    '  fill="#7c8096" text-anchor="middle" dominant-baseline="middle">' + label + '</text>',
    '<text x="' + cx + '" y="' + (h - sub) + '"',
    '  font-family="monospace" font-size="' + Math.round(sub * 0.8) + '"',
    '  fill="#4a4f63" text-anchor="middle" dominant-baseline="middle">' + w + ' x ' + h + '</text>',
    '</svg>',
  ]

  return parts.join('\n')
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
