// lib/discord/embeds.ts
// ─────────────────────────────────────────────────────────────────────────────
// Discord embed builders — one function per event type
// Each builder returns a fully-formed Discord embed object
// To add a new event type: add to types.ts → add color to colors.ts → add builder here → wire in BUILDERS map
// ─────────────────────────────────────────────────────────────────────────────

import { EVENT_COLORS, CATEGORY_COLORS, BRAND } from './colors'
import { PLATFORM, SKIP_AS_FIELD } from './types'
import type { EventType, SiteEvent } from './types'

// ── Discord field type ────────────────────────────────────────────────────────
type EmbedField = {
  name:    string
  value:   string
  inline?: boolean
}

// ── Discord embed type ────────────────────────────────────────────────────────
// Full Discord embed spec — only include fields that are set
export type DiscordEmbed = {
  title:        string
  description?: string
  url?:         string
  color:        number
  thumbnail?:   { url: string }
  image?:       { url: string }
  author?:      { name: string; icon_url?: string; url?: string }
  fields?:      EmbedField[]
  footer:       { text: string; icon_url?: string }
  timestamp:    string
}

// ── Shared: footer ────────────────────────────────────────────────────────────
// All embeds use this — source param appears as "via agent" etc
function footer(source?: string): { text: string; icon_url: string } {
  return {
    text:     `Amanda Photography${source ? ` · via ${source}` : ''} · amandaland.vercel.app`,
    icon_url: PLATFORM.logo,
  }
}

// ── Shared: Amanda author block ───────────────────────────────────────────────
// Appears at top of embed — name, logo, link to portfolio
function amandaAuthor(): { name: string; icon_url: string; url: string } {
  return {
    name:     'Amanda Photography',
    icon_url: PLATFORM.logo,
    url:      PLATFORM.portfolio,
  }
}

// ── Shared: meta → fields ─────────────────────────────────────────────────────
// Converts remaining meta keys to Discord inline fields
// Skips reserved keys (message, url, source, thumbnail) — handled separately
function metaFields(
  meta: Record<string, string>,
  extraSkip: string[] = []
): EmbedField[] {
  const skip = new Set([...SKIP_AS_FIELD, ...extraSkip])
  return Object.entries(meta)
    .filter(([k]) => !skip.has(k))
    .map(([name, value]) => ({
      name,
      value:  String(value).slice(0, 1024), // Discord field value hard limit
      inline: true,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// EMBED BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

// ── 📅 Booking Inquiry ────────────────────────────────────────────────────────
// Highest priority embed — pink sidebar, prominent description, links to agent
// Fired when a client requests a session through the Amanda agent
function bookingInquiry(event: SiteEvent): DiscordEmbed {
  return {
    title:       '📅 New Booking Inquiry',
    description: event.meta.message
      ? `> ${event.meta.message}`
      : 'A client has requested a session through the Amanda agent.',
    url:         PLATFORM.agent,
    color:       BRAND.pink,
    author:      amandaAuthor(),
    thumbnail:   { url: PLATFORM.logo },
    fields: [
      { name: '📍 Location',  value: 'Thomasville, NC',                              inline: true },
      { name: '🔗 Agent',     value: `[Open Agent](${PLATFORM.agent})`,              inline: true },
      { name: '🌐 Portfolio', value: `[View Portfolio](${PLATFORM.portfolio})`,      inline: true },
      ...metaFields(event.meta, ['message']),
    ],
    footer:    footer(event.meta.source),
    timestamp: event.timestamp,
  }
}

// ── ⬆️ Upload Complete ────────────────────────────────────────────────────────
// Color-coded by category — shows thumbnail if Cloudinary URL available
// Fired by upload/route.ts after successful Blob + Cloudinary write
function uploadComplete(event: SiteEvent): DiscordEmbed {
  const color = event.meta.category
    ? (CATEGORY_COLORS[event.meta.category] ?? BRAND.teal)
    : BRAND.teal

  const fields: EmbedField[] = []
  if (event.meta.category)    fields.push({ name: '📂 Category',  value: event.meta.category,              inline: true })
  if (event.meta.size)        fields.push({ name: '📦 Size',      value: event.meta.size,                  inline: true })
  if (event.meta.cloudinaryId) fields.push({ name: '☁️ Cloudinary', value: `\`${event.meta.cloudinaryId}\``, inline: true })

  return {
    title:       '⬆️ New Asset Uploaded',
    description: event.meta.filename
      ? `**${event.meta.filename}** added to the studio`
      : 'New asset uploaded to Amanda Photography studio',
    url:         `${PLATFORM.studio}/dashboard`,
    color,
    author:      amandaAuthor(),
    thumbnail:   event.meta.thumbnail ? { url: event.meta.thumbnail } : undefined,
    fields:      fields.length ? fields : undefined,
    footer:      footer('studio'),
    timestamp:   event.timestamp,
  }
}

// ── 💰 Asset Sold ─────────────────────────────────────────────────────────────
// Gold embed — shows price in USD and Antcoin if set
// Fired when an asset status is set to sold in the dashboard
function assetSold(event: SiteEvent): DiscordEmbed {
  const fields: EmbedField[] = []
  if (event.meta.priceUsd)  fields.push({ name: '💵 Price',    value: `$${event.meta.priceUsd}`, inline: true })
  if (event.meta.antcoin)   fields.push({ name: '🪙 Antcoin',  value: event.meta.antcoin,        inline: true })
  if (event.meta.category)  fields.push({ name: '📂 Category', value: event.meta.category,       inline: true })

  return {
    title:       '💰 Asset Sold',
    description: event.meta.filename
      ? `**${event.meta.filename}** has been sold`
      : 'An asset has been sold',
    color:       BRAND.gold,
    author:      amandaAuthor(),
    thumbnail:   event.meta.thumbnail ? { url: event.meta.thumbnail } : undefined,
    fields:      fields.length ? fields : undefined,
    footer:      footer(),
    timestamp:   event.timestamp,
  }
}

// ── 🔥 Hot Alert ──────────────────────────────────────────────────────────────
// Red embed — manual high-priority alert from agent or admin
// message field becomes the main description
function hotAlert(event: SiteEvent): DiscordEmbed {
  return {
    title:       '🔥 Hot Alert — Amanda Photography',
    description: event.meta.message || 'Something needs immediate attention.',
    url:         event.meta.url || PLATFORM.studio,
    color:       BRAND.red,
    author:      amandaAuthor(),
    fields:      metaFields(event.meta),
    footer:      footer(event.meta.source),
    timestamp:   event.timestamp,
  }
}

// ── 🤖 Agent Action ───────────────────────────────────────────────────────────
// Purple embed — fired when the Amanda agent takes a platform action
// Covers: Discord posts, Arena boosts, platform summaries sent
function agentAction(event: SiteEvent): DiscordEmbed {
  const fields: EmbedField[] = []
  if (event.meta.action)   fields.push({ name: '⚡ Action',    value: event.meta.action,                         inline: true })
  if (event.meta.category) fields.push({ name: '📂 Category',  value: event.meta.category,                       inline: true })
  fields.push(              { name: '🌐 Portfolio', value: `[View](${PLATFORM.portfolio})`,                       inline: true })

  return {
    title:       '🤖 Agent Action — Amanda',
    description: event.meta.message
      ? `> ${event.meta.message}`
      : 'The Amanda agent fired a platform action.',
    url:         event.meta.url || PLATFORM.agent,
    color:       BRAND.purple,
    author: {
      name:     'Amanda Agent',
      icon_url: PLATFORM.logo,
      url:      PLATFORM.agent,
    },
    fields,
    footer:    footer('agent'),
    timestamp: event.timestamp,
  }
}

// ── 🎨 Print Inquiry ──────────────────────────────────────────────────────────
// Amber embed — visitor interested in a physical print
// Shows thumbnail of the asset they inquired about
function printInquiry(event: SiteEvent): DiscordEmbed {
  return {
    title:       '🎨 Print Inquiry',
    description: event.meta.message || 'A visitor is interested in a print.',
    url:         event.meta.url || PLATFORM.portfolio,
    color:       BRAND.amber,
    author:      amandaAuthor(),
    thumbnail:   event.meta.thumbnail ? { url: event.meta.thumbnail } : undefined,
    fields:      metaFields(event.meta),
    footer:      footer(),
    timestamp:   event.timestamp,
  }
}

// ── 👁️ Gallery View / 🖼️ Image View ──────────────────────────────────────────
// Blue embed — lightweight, no thumbnail
// High frequency event — kept minimal to avoid Discord noise
function galleryOrImageView(event: SiteEvent): DiscordEmbed {
  return {
    title:     event.type === 'image_view' ? '🖼️ Image Viewed' : '👁️ Gallery Viewed',
    color:     BRAND.blue,
    fields:    metaFields(event.meta),
    footer:    footer(),
    timestamp: event.timestamp,
  }
}

// ── 💾 Download Interest ──────────────────────────────────────────────────────
// Violet embed — visitor clicked download on an asset
function downloadInterest(event: SiteEvent): DiscordEmbed {
  return {
    title:       '💾 Download Interest',
    description: event.meta.filename
      ? `Visitor interested in downloading **${event.meta.filename}**`
      : 'A visitor clicked download on an asset.',
    color:       BRAND.violet,
    author:      amandaAuthor(),
    thumbnail:   event.meta.thumbnail ? { url: event.meta.thumbnail } : undefined,
    fields:      metaFields(event.meta),
    footer:      footer(),
    timestamp:   event.timestamp,
  }
}

// ── 🔗 Referral ───────────────────────────────────────────────────────────────
// Blue embed — traffic referred from Arena, social, or external link
function referral(event: SiteEvent): DiscordEmbed {
  return {
    title:       '🔗 Referral Traffic',
    description: event.meta.source
      ? `Referred from **${event.meta.source}**`
      : 'New referral traffic to the portfolio.',
    color:       BRAND.blue,
    fields:      metaFields(event.meta),
    footer:      footer(),
    timestamp:   event.timestamp,
  }
}

// ── 🔔 CTA Click ──────────────────────────────────────────────────────────────
// Lime embed — visitor clicked a call-to-action button
function ctaClick(event: SiteEvent): DiscordEmbed {
  return {
    title:       '🔔 CTA Clicked',
    description: event.meta.message || undefined,
    url:         event.meta.url     || undefined,
    color:       BRAND.lime,
    fields:      metaFields(event.meta),
    footer:      footer(event.meta.source),
    timestamp:   event.timestamp,
  }
}

// ── Generic fallback ──────────────────────────────────────────────────────────
// Used for any event type not explicitly handled above
// Logs all meta as fields — useful during development
function generic(event: SiteEvent): DiscordEmbed {
  return {
    title:     event.label,
    color:     EVENT_COLORS[event.type] ?? BRAND.grey,
    fields:    metaFields(event.meta),
    footer:    footer(event.meta.source),
    timestamp: event.timestamp,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER ROUTER
// Maps each EventType to its builder function
// Add new event types here after adding builder above
// ─────────────────────────────────────────────────────────────────────────────
const BUILDERS: Partial<Record<EventType, (e: SiteEvent) => DiscordEmbed>> = {
  booking_inquiry:   bookingInquiry,
  upload_complete:   uploadComplete,
  asset_sold:        assetSold,
  hot_alert:         hotAlert,
  agent_action:      agentAction,
  print_inquiry:     printInquiry,
  gallery_view:      galleryOrImageView,
  image_view:        galleryOrImageView,
  download_interest: downloadInterest,
  referral:          referral,
  cta_click:         ctaClick,
}

// ── Main export ───────────────────────────────────────────────────────────────
// Called by notify/route.ts — pass the full event, get back a Discord embed
export function buildEmbed(event: SiteEvent): DiscordEmbed {
  const builder = BUILDERS[event.type] ?? generic
  return builder(event)
}
