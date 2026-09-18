// lib/categories.ts
// ─────────────────────────────────────────────────────────────────────────────
// Static fallback category list — used by search, upload validation, and
// any component that needs categories without an async fetch.
//
// ⚠️ Supabase (photo_categories table) is now the source of truth.
// This file is the offline/fallback layer only.
// To add categories: insert rows in ADS Supabase → photo_categories.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = {
  id:    string
  label: string
  emoji: string
}

export const CATEGORIES: Category[] = [
  // ── Photography genres ────────────────────────────────────────────────────
  { id: 'portrait',     label: 'Portrait',     emoji: '🎭' },
  { id: 'wedding',      label: 'Wedding',       emoji: '💍' },
  { id: 'events',       label: 'Events',        emoji: '🎉' },
  { id: 'sports',       label: 'Sports',        emoji: '⚡' },
  { id: 'food',         label: 'Food',          emoji: '🍽️' },
  { id: 'fashion',      label: 'Fashion',       emoji: '👗' },
  { id: 'travel',       label: 'Travel',        emoji: '✈️' },
  { id: 'lifestyle',    label: 'Lifestyle',     emoji: '🌿' },
  { id: 'nature',       label: 'Nature',        emoji: '🌲' },
  { id: 'urban',        label: 'Urban',         emoji: '🏙️' },
  { id: 'documentary',  label: 'Documentary',   emoji: '🎞️' },
  { id: 'music',        label: 'Music',         emoji: '🎵' },
  { id: 'architecture', label: 'Architecture',  emoji: '🏛️' },
  // ── Real Estate ───────────────────────────────────────────────────────────
  { id: 'real-estate',  label: 'Real Estate',   emoji: '🏠' },
  { id: 'property',     label: 'Property',      emoji: '🏡' },
  { id: 'land',         label: 'Land',          emoji: '🌱' },
  // ── Brand Work ────────────────────────────────────────────────────────────
  { id: 'brand',        label: 'Brand',         emoji: '⚡' },
  { id: 'product',      label: 'Product',       emoji: '📦' },
  { id: 'headshots',    label: 'Headshots',     emoji: '🧑' },
  { id: 'commercial',   label: 'Commercial',    emoji: '📢' },
  // ── Video ─────────────────────────────────────────────────────────────────
  { id: 'video',        label: 'Video',         emoji: '🎬' },
  { id: 'reel',         label: 'Reel',          emoji: '📱' },
  { id: 'bts',          label: 'BTS',           emoji: '🎥' },
]

// Convenience: label strings for dropdowns and validation
export const CATEGORY_LABELS  = CATEGORIES.map(c => c.label)
export const DEFAULT_CATEGORY = CATEGORIES[0].label // 'Portrait'
