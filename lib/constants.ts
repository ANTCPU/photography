// lib/constants.ts
// Single source of truth — imported by all APIs, components, and agents
// Never hardcode placeholder URLs anywhere else
// Last updated: Fall 2026 — fall-banner.png active

export const PLATFORM = {
  name:       'Amanda Photography',
  baseUrl:    'https://amandaland.vercel.app',
  publicSite: 'https://antcpu.com/manda',
} as const

export const CLOUDINARY = {
  folder: 'amandaland',
  baseUrl: 'https://res.cloudinary.com/dz0zxxd7d/image/upload',
} as const

export const PLACEHOLDERS = {
  profile:   'https://w9cysoaxfshj0nmr.public.blob.vercel-storage.com/assets/Portrait/profile.png',
  banner:    'https://w9cysoaxfshj0nmr.public.blob.vercel-storage.com/assets/Lifestyle/fall-banner.png',
  thumbnail: 'https://w9cysoaxfshj0nmr.public.blob.vercel-storage.com/assets/Portrait/profile.png',
} as const

export const SEASON = {
  current:    'fall',
  label:      'Fall 2026',
  bookingOpen: true,
  cta:        'Fall booking season is open — limited dates available.',
  bannerKey:  'fall-banner',
} as const

export const SOCIAL_SIZES = {
  instagram: {
    profile:    { w: 320,  h: 320  },
    postSquare: { w: 1080, h: 1080 },
    postVert:   { w: 1080, h: 1350 },
    postHoriz:  { w: 1080, h: 566  },
    story:      { w: 1080, h: 1920 },
  },
  twitter: {
    profile:    { w: 400,  h: 400  },
    banner:     { w: 1500, h: 500  },
    postSquare: { w: 1080, h: 1080 },
    postVert:   { w: 1080, h: 1350 },
    postHoriz:  { w: 1600, h: 900  },
    linkCard:   { w: 1200, h: 630  },
  },
  linkedin: {
    profile:      { w: 400,  h: 400  },
    cover:        { w: 1584, h: 396  },
    companyCover: { w: 1128, h: 191  },
    postVert:     { w: 1080, h: 1350 },
    postHoriz:    { w: 1080, h: 360  },
    linkImage:    { w: 1200, h: 627  },
  },
  facebook: {
    profile:    { w: 320,  h: 320  },
    cover:      { w: 851,  h: 315  },
    postSquare: { w: 1080, h: 1080 },
    postVert:   { w: 1080, h: 1350 },
    story:      { w: 1080, h: 1920 },
    linkImage:  { w: 1200, h: 630  },
  },
  tiktok: {
    profile: { w: 200,  h: 200  },
    post:    { w: 1080, h: 1920 },
  },
  youtube: {
    profile:   { w: 800,  h: 800  },
    banner:    { w: 2560, h: 1440 },
    thumbnail: { w: 1280, h: 720  },
  },
  pinterest: {
    profile: { w: 165,  h: 165  },
    cover:   { w: 800,  h: 450  },
    pin:     { w: 1000, h: 1500 },
  },
  bluesky: {
    profile:   { w: 400,  h: 400  },
    cover:     { w: 1500, h: 500  },
    linkImage: { w: 1200, h: 627  },
  },
} as const

// ── Cloudinary transform helpers ──────────────────────────────────────────────
// Use these instead of building transform strings manually anywhere in the app

export function cloudinaryUrl(
  publicId: string,
  opts: {
    w?: number
    h?: number
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop'
    gravity?: 'face' | 'auto' | 'center'
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  } = {}
): string {
  const {
    w,
    h,
    crop    = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format  = 'auto',
  } = opts

  const transforms = [
    `c_${crop}`,
    gravity ? `g_${gravity}` : null,
    w       ? `w_${w}`       : null,
    h       ? `h_${h}`       : null,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(',')

  return `${CLOUDINARY.baseUrl}/${transforms}/${CLOUDINARY.folder}/${publicId}`
}

// ── Preset transforms — use these directly in components ──────────────────────

export const TRANSFORMS = {
  // Square thumbnail — asset grid, category cards
  thumb: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 400, h: 400, crop: 'fill', gravity: 'face' }),

  // Hero banner — full width, 16:9
  hero: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 1920, h: 1080, crop: 'fill', gravity: 'auto' }),

  // Portrait card — 4:5
  portrait: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 800, h: 1000, crop: 'fill', gravity: 'face' }),

  // Social — Instagram square
  igSquare: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 1080, h: 1080, crop: 'fill', gravity: 'auto' }),

  // Social — Instagram story
  igStory: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 1080, h: 1920, crop: 'fill', gravity: 'auto' }),

  // Social — Twitter/X card
  twitterCard: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 1200, h: 630, crop: 'fill', gravity: 'auto' }),

  // Social — YouTube thumbnail
  ytThumb: (publicId: string) =>
    cloudinaryUrl(publicId, { w: 1280, h: 720, crop: 'fill', gravity: 'auto' }),
} as const

// ── Category config — single source for all category display logic ─────────────

export const CATEGORIES = [
  {
    id:       'Lifestyle',
    label:    'Lifestyle',
    emoji:    '🌿',
    slug:     'lifestyle',
    live:     true,
    priority: 1,
  },
  {
    id:       'Portrait',
    label:    'Portrait',
    emoji:    '🎭',
    slug:     'portrait',
    live:     true,
    priority: 2,
  },
  {
    id:       'Sports',
    label:    'Sports',
    emoji:    '⚡',
    slug:     'sports',
    live:     true,
    priority: 3,
  },
  {
    id:       'Travel',
    label:    'Travel',
    emoji:    '✈️',
    slug:     'travel',
    live:     true,
    priority: 4,
  },
  {
    id:       'Food',
    label:    'Culinary',
    emoji:    '🍽️',
    slug:     'culinary',
    live:     true,
    priority: 5,
  },
  {
    id:       'Events',
    label:    'Events',
    emoji:    '🎉',
    slug:     'events',
    live:     false,
    priority: 6,
  },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']

// ── Agent config ──────────────────────────────────────────────────────────────

export const AGENT = {
  name:        'Amanda',
  handle:      '@amanda',
  endpoint:    'https://amandaland.vercel.app/api/chat',
  publicAgent: 'https://antcpu.com/manda/agent/',
  model:       'gpt-4o-mini',
  maxTokens:   280,
  systemPrompt: `You are Amanda, a warm and professional photographer.
Specialties: portraits, lifestyle, sports, travel, and events.
It is fall 2026 — fall booking season is open and dates are filling up fast.
Be conversational, personal, and helpful.
Guide clients toward booking a session.
When someone wants to book: ask their name, session type, preferred date, and location.
Keep every reply under 3 sentences.
Never mention being an AI.`,
} as const

// ── API endpoints — use these instead of hardcoding URLs ─────────────────────

export const API = {
  assets:    `${PLATFORM.baseUrl}/api/assets`,
  search:    `${PLATFORM.baseUrl}/api/search`,
  stats:     `${PLATFORM.baseUrl}/api/stats`,
  upload:    `${PLATFORM.baseUrl}/api/upload`,
  auth:      `${PLATFORM.baseUrl}/api/auth`,
  chat:      `${PLATFORM.baseUrl}/api/chat`,
  notify:    `${PLATFORM.baseUrl}/api/notify`,
  resize:    `${PLATFORM.baseUrl}/api/resize`,
  socialPack:`${PLATFORM.baseUrl}/api/social-pack`,
  placeholders: `${PLATFORM.baseUrl}/api/placeholders`,
} as const
