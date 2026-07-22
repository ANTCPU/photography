// lib/discord/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single export point for the Amanda Photography Discord notification system
//
// Usage — import everything from here:
//   import { buildEmbed, BRAND, PLATFORM } from '@/lib/discord'
//   import type { EventType, SiteEvent, DiscordEmbed } from '@/lib/discord'
//
// Never import from colors.ts / embeds.ts / types.ts directly
// This file is the public API of the discord lib
// ─────────────────────────────────────────────────────────────────────────────

// ── Functions ─────────────────────────────────────────────────────────────────
export { buildEmbed }                                        from './embeds'

// ── Color maps ────────────────────────────────────────────────────────────────
export { BRAND, EVENT_COLORS, CATEGORY_COLORS, TIER_COLORS } from './colors'

// ── Constants ─────────────────────────────────────────────────────────────────
export { PLATFORM, SKIP_AS_FIELD }                           from './types'

// ── Types ─────────────────────────────────────────────────────────────────────
export type { EventType, SiteEvent }                         from './types'
export type { DiscordEmbed }                                 from './embeds'
