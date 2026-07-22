// lib/discord/colors.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Discord embed colors for the Amanda Photography platform
// Discord uses hex integers — not strings
// Import from lib/discord (index.ts) — never import this file directly
// ─────────────────────────────────────────────────────────────────────────────

import type { EventType } from './types'

// ── Brand palette ─────────────────────────────────────────────────────────────
// Single source of truth for all colors across the platform
// Update here — propagates to every Discord embed automatically
export const BRAND = {
  pink:   0xe91e8c,  // Amanda Photography primary — bookings, portraits
  purple: 0xc084fc,  // ANTCPU agent / platform actions
  lime:   0xc8f564,  // ANTCPU accent — CTA, sold, earned
  teal:   0x34d6a8,  // success / live / upload complete
  blue:   0x4da6ff,  // info / gallery views / referral
  amber:  0xf5a623,  // warning / print inquiry / food category
  red:    0xff5e5e,  // alert / hot / error
  violet: 0xb57bff,  // download interest / lifestyle
  gold:   0xc8f564,  // asset sold / earnings
  grey:   0x7c8096,  // fallback / muted
} as const

// ── Event type → Discord embed sidebar color ──────────────────────────────────
// Every event type must have an entry here
// Add new event types to types.ts first, then add color here
export const EVENT_COLORS: Record<EventType, number> = {
  gallery_view:      BRAND.blue,
  image_view:        BRAND.teal,
  download_interest: BRAND.violet,
  print_inquiry:     BRAND.amber,
  cta_click:         BRAND.lime,
  hot_alert:         BRAND.red,
  referral:          BRAND.blue,
  upload_complete:   BRAND.teal,
  asset_sold:        BRAND.gold,
  booking_inquiry:   BRAND.pink,   // highest priority — stands out in Discord
  agent_action:      BRAND.purple, // agent-fired — purple matches platform UI
}

// ── Category → color ──────────────────────────────────────────────────────────
// Used in upload embeds to color-code by shoot category
// Matches the category system in lib/categories.ts
export const CATEGORY_COLORS: Record<string, number> = {
  Portrait:  BRAND.pink,
  Lifestyle: BRAND.purple,
  Travel:    BRAND.blue,
  Food:      BRAND.amber,
  Sports:    BRAND.teal,
  Culinary:  BRAND.amber,
  Nature:    BRAND.teal,
  Events:    BRAND.lime,
  Wedding:   BRAND.pink,
  Newborn:   BRAND.violet,
}

// ── Arena tier → color ────────────────────────────────────────────────────────
// Used when agent fires Arena-related notifications
export const TIER_COLORS: Record<string, number> = {
  entry:      BRAND.grey,
  rising:     BRAND.blue,
  featured:   BRAND.amber,
  'top-tier': BRAND.gold,
}
