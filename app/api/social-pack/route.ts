// app/api/social-pack/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Social Pack API
// Returns Cloudinary-transformed image URLs for every Arena/social platform
// No auth required — URLs are public Cloudinary delivery links
// No Sharp, no storage — Cloudinary handles all transforms via URL params
//
// Usage:
//   GET /api/social-pack?id=amandaland/Food/IMG_0430
//   GET /api/social-pack?id=amandaland/Portrait/profile&brand=Amanda+Photography
//
// Returns: JSON with icon, pack (all platform sizes), megaCopy
// Used by: Arena ad cards, Amanda agent, future brand dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { CLOUDINARY, PLATFORM } from '@/lib/constants'

export const runtime = 'edge'

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  // Cache for 1 hour — URLs are deterministic, Cloudinary CDN serves them
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

const CDN = 'https://res.cloudinary.com/dz0zxxd7d/image/upload'

// ── Build a Cloudinary transform URL ─────────────────────────────────────────
// params: Cloudinary transformation string e.g. "c_fill,w_80,h_80,q_auto,f_auto"
function cld(params: string, publicId: string): string {
  return `${CDN}/${params}/${publicId}`
}

// ── Platform pack definitions ─────────────────────────────────────────────────
// Each entry becomes a URL in the response pack
// Cloudinary handles the crop — g_auto finds the salient region automatically
const PACK_SIZES = [
  // Ad icon — small square for Arena ad card
  { key: 'adIcon',           label: 'Ad Icon',              params: 'c_fill,g_auto,w_80,h_80,q_auto,f_auto'       },
  { key: 'adIconLarge',      label: 'Ad Icon Large',        params: 'c_fill,g_auto,w_200,h_200,q_auto,f_auto'     },

  // Instagram
  { key: 'instagramSquare',  label: 'Instagram Post',       params: 'c_fill,g_auto,w_1080,h_1080,q_auto,f_auto'   },
  { key: 'instagramStory',   label: 'Instagram Story',      params: 'c_fill,g_auto,w_1080,h_1920,q_auto,f_auto'   },
  { key: 'instagramVert',    label: 'Instagram Portrait',   params: 'c_fill,g_auto,w_1080,h_1350,q_auto,f_auto'   },

  // X / Twitter
  { key: 'twitterPost',      label: 'X Post',               params: 'c_fill,g_auto,w_1600,h_900,q_auto,f_auto'    },
  { key: 'twitterCard',      label: 'X Link Card',          params: 'c_fill,g_auto,w_1200,h_630,q_auto,f_auto'    },

  // LinkedIn
  { key: 'linkedinPost',     label: 'LinkedIn Post',        params: 'c_fill,g_auto,w_1200,h_627,q_auto,f_auto'    },
  { key: 'linkedinStory',    label: 'LinkedIn Portrait',    params: 'c_fill,g_auto,w_1080,h_1350,q_auto,f_auto'   },

  // Facebook
  { key: 'facebookPost',     label: 'Facebook Post',        params: 'c_fill,g_auto,w_1080,h_1080,q_auto,f_auto'   },
  { key: 'facebookStory',    label: 'Facebook Story',       params: 'c_fill,g_auto,w_1080,h_1920,q_auto,f_auto'   },

  // TikTok
  { key: 'tiktok',           label: 'TikTok',               params: 'c_fill,g_auto,w_1080,h_1920,q_auto,f_auto'   },

  // YouTube
  { key: 'youtubeThumbnail', label: 'YouTube Thumbnail',    params: 'c_fill,g_auto,w_1280,h_720,q_auto,f_auto'    },

  // Pinterest
  { key: 'pinterestPin',     label: 'Pinterest Pin',        params: 'c_fill,g_auto,w_1000,h_1500,q_auto,f_auto'   },

  // OG / link preview — used when sharing the Arena ad URL
  { key: 'ogImage',          label: 'OG / Link Preview',    params: 'c_fill,g_auto,w_1200,h_630,q_auto,f_auto'    },
] as const

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // ── Required: Cloudinary public ID ───────────────────────────────────────
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required param: id (Cloudinary public ID)' },
      { status: 400, headers: HEADERS }
    )
  }

  // ── Optional: brand name + ad URL for mega copy ───────────────────────────
  const brand   = searchParams.get('brand')   || PLATFORM.name
  const adUrl   = searchParams.get('url')     || PLATFORM.publicSite
  const caption = searchParams.get('caption') || null

  // ── Build the full pack ───────────────────────────────────────────────────
  const pack: Record<string, { label: string; url: string; w: number; h: number }> = {}

  for (const size of PACK_SIZES) {
    // Extract w and h from params string for reference
    const wMatch = size.params.match(/w_(\d+)/)
    const hMatch = size.params.match(/h_(\d+)/)
    pack[size.key] = {
      label: size.label,
      url:   cld(size.params, id),
      w:     wMatch ? parseInt(wMatch[1]) : 0,
      h:     hMatch ? parseInt(hMatch[1]) : 0,
    }
  }

  // ── Build mega copy ───────────────────────────────────────────────────────
  // Pre-written share text — paste directly to any platform
  const defaultCaption = caption || `📸 ${brand} — professional photography in Thomasville, NC.\n\nPortraits · Events · Special Occasions\n\nBook your session today.`

  const megaCopy = {
    // Full share text with link
    text: `${defaultCaption}\n\n→ ${adUrl}`,

    // Hashtags block
    hashtags: '#photography #portraits #ncphotographer #familyphotos #bookingsopen',

    // Platform-specific copy variants
    instagram: `${defaultCaption}\n\n→ Link in bio\n\n#photography #portraits #ncphotographer #familyphotos`,
    twitter:   `${defaultCaption}\n\n→ ${adUrl}\n\n#photography #portraits`,
    linkedin:  `${defaultCaption}\n\nAvailable for bookings — reach out directly.\n\n→ ${adUrl}`,
    facebook:  `${defaultCaption}\n\n→ ${adUrl}`,

    // The OG image URL — used as the preview image when sharing the ad URL
    ogImageUrl: pack.ogImage.url,

    // Single-line copy for quick paste
    quickShare: `${brand} — ${adUrl}`,
  }

  // ── Response ──────────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      ok:       true,
      id,
      brand,
      adUrl,

      // Small icon for Arena ad card
      icon:     pack.adIcon.url,
      iconLarge: pack.adIconLarge.url,

      // Full platform pack
      pack,

      // Mega copy — ready to paste
      megaCopy,

      // Meta
      totalSizes: PACK_SIZES.length,
      cdn:        CDN,
      folder:     CLOUDINARY.folder,
    },
    { status: 200, headers: HEADERS }
  )
}
