// lib/categories.ts
// ─────────────────────────────────────────────────────────────────────────────
// Static fallback category list — used by search, upload validation, and
// any component that needs categories without an async fetch.
//
// ⚠️ Supabase (photo_categories table) is now the source of truth.
// This file is the offline/fallback layer only.
// To add categories: insert rows in ADS Supabase → photo_categories.
//
// Brand hierarchy:
//   Tier 1 — ANTCPU (parent company)
//   Tier 2 — Amanda Photography (this platform — service brand)
//   Tier 3 — Map of Pi (featured brand — global marketing build)
// ─────────────────────────────────────────────────────────────────────────────

export type Category = {
  id:    string
  label: string
  emoji: string
  tier?: 1 | 2 | 3   // 1=ANTCPU, 2=Photography, 3=Featured brand
}

export const CATEGORIES: Category[] = [

  // ── Tier 2 — Photography genres (Amanda's work) ───────────────────────────
  { id: 'portrait',     label: 'Portrait',     emoji: '🎭', tier: 2 },
  { id: 'wedding',      label: 'Wedding',       emoji: '💍', tier: 2 },
  { id: 'events',       label: 'Events',        emoji: '🎉', tier: 2 },
  { id: 'sports',       label: 'Sports',        emoji: '⚡', tier: 2 },
  { id: 'food',         label: 'Food',          emoji: '🍽️', tier: 2 },
  { id: 'fashion',      label: 'Fashion',       emoji: '👗', tier: 2 },
  { id: 'travel',       label: 'Travel',        emoji: '✈️', tier: 2 },
  { id: 'lifestyle',    label: 'Lifestyle',     emoji: '🌿', tier: 2 },
  { id: 'nature',       label: 'Nature',        emoji: '🌲', tier: 2 },
  { id: 'urban',        label: 'Urban',         emoji: '🏙️', tier: 2 },
  { id: 'documentary',  label: 'Documentary',   emoji: '🎞️', tier: 2 },
  { id: 'music',        label: 'Music',         emoji: '🎵', tier: 2 },
  { id: 'architecture', label: 'Architecture',  emoji: '🏛️', tier: 2 },
  { id: 'real-estate',  label: 'Real Estate',   emoji: '🏠', tier: 2 },
  { id: 'property',     label: 'Property',      emoji: '🏡', tier: 2 },
  { id: 'land',         label: 'Land',          emoji: '🌱', tier: 2 },
  { id: 'brand',        label: 'Brand',         emoji: '📢', tier: 2 },
  { id: 'product',      label: 'Product',       emoji: '📦', tier: 2 },
  { id: 'headshots',    label: 'Headshots',     emoji: '🧑', tier: 2 },
  { id: 'commercial',   label: 'Commercial',    emoji: '💼', tier: 2 },
  { id: 'video',        label: 'Video',         emoji: '🎬', tier: 2 },
  { id: 'reel',         label: 'Reel',          emoji: '📱', tier: 2 },
  { id: 'bts',          label: 'BTS',           emoji: '🎥', tier: 2 },

  // ── Tier 1 — ANTCPU brand assets ─────────────────────────────────────────
  { id: 'antcpu',       label: 'ANTCPU',        emoji: '⚡', tier: 1 },
  { id: 'antcpu-edu',   label: 'ANTCPU EDU',    emoji: '📚', tier: 1 },
  { id: 'antcpu-coin',  label: 'ANTCPU Coin',   emoji: '🪙', tier: 1 },

  // ── Tier 3 — Map of Pi brand assets ──────────────────────────────────────
  { id: 'mapofpi',              label: 'Map of Pi',          emoji: '🗺️', tier: 3 },
  { id: 'mapofpi-transport',    label: 'MoP Transport',      emoji: '🚗', tier: 3 },
  { id: 'mapofpi-services',     label: 'MoP Services',       emoji: '✂️', tier: 3 },
  { id: 'mapofpi-food',         label: 'MoP Food',           emoji: '🛒', tier: 3 },
  { id: 'mapofpi-health',       label: 'MoP Health',         emoji: '💊', tier: 3 },
  { id: 'mapofpi-electronics',  label: 'MoP Electronics',    emoji: '📱', tier: 3 },
  { id: 'mapofpi-clothing',     label: 'MoP Clothing',       emoji: '👕', tier: 3 },
  { id: 'pipioneersx',          label: 'PiPioneersX',        emoji: '🚀', tier: 3 },

]

// Convenience exports
export const CATEGORY_LABELS  = CATEGORIES.map(c => c.label)
export const DEFAULT_CATEGORY = CATEGORIES[0].label // 'Portrait'

// Filtered views — useful for upload dropdowns and dashboard filters
export const PHOTO_CATEGORIES  = CATEGORIES.filter(c => c.tier === 2)
export const ANTCPU_CATEGORIES = CATEGORIES.filter(c => c.tier === 1)
export const BRAND_CATEGORIES  = CATEGORIES.filter(c => c.tier === 3)
