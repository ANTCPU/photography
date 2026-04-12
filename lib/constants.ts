// lib/constants.ts
// Single source of truth — imported by all APIs, components, and agents
// Never hardcode placeholder URLs anywhere else

export const PLATFORM = {
  name:       'Amanda Photography',
  baseUrl:    'https://amandaland.vercel.app',
  publicSite: 'https://antcpu.com/manda',
} as const

export const PLACEHOLDERS = {
  profile:   'https://amandaland.vercel.app/api/placeholders?type=profile',
  banner:    'https://amandaland.vercel.app/api/placeholders?type=banner',
  thumbnail: 'https://amandaland.vercel.app/api/placeholders?type=thumbnail',
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
