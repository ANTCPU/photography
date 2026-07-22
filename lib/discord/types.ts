// lib/discord/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the Amanda Photography Discord notification system
// Import these in embeds.ts, route.ts, and any future notification layer
// ─────────────────────────────────────────────────────────────────────────────

// ── All event types the platform can fire ────────────────────────────────────
// Add new types here first — then add color + label + embed builder
export type EventType =
  | 'gallery_view'       // visitor viewed the gallery
  | 'image_view'         // visitor viewed a specific image
  | 'download_interest'  // visitor clicked download
  | 'print_inquiry'      // visitor inquired about a print
  | 'cta_click'          // visitor clicked a CTA button
  | 'hot_alert'          // manual hot alert from agent
  | 'referral'           // referral traffic event
  | 'upload_complete'    // new asset uploaded to studio
  | 'asset_sold'         // asset marked as sold
  | 'booking_inquiry'    // client requested a session via agent
  | 'agent_action'       // agent fired an action (post, boost, etc)

// ── A platform event as stored in KV ─────────────────────────────────────────
export type SiteEvent = {
  id:        string
  type:      EventType
  label:     string
  meta:      Record<string, string>
  timestamp: string
}

// ── Meta fields that should NOT appear as Discord embed fields ────────────────
// These are handled separately (description, url, footer)
export const SKIP_AS_FIELD = new Set(['message', 'url', 'source', 'thumbnail'])

// ── Platform identity — used in all embed footers ────────────────────────────
export const PLATFORM = {
  name:      'Amanda Photography',
  studio:    'https://amandaland.vercel.app',
  portfolio: 'https://antcpu.com/manda',
  agent:     'https://antcpu.com/manda/agent/',
  arena:     'https://antcpu-ads.vercel.app/arena',
  logo:      'https://antcpu.com/drive/stock/logo/amandaphotographylogo.png',
}
