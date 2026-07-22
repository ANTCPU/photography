// lib/categories.ts
// ── Single source of truth for categories ──
// Structure: Photography genres first, then brand containers (parent → subs)
// To add/remove: edit this file only.
// Future: swap getCategories() to read from KV — nothing else changes.

export type Category = {
  id:    string;
  label: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [

  // ── Photography genres ────────────────────────────────────────────────────
  { id: 'portrait',        label: 'Portrait',      emoji: '🎭' },
  { id: 'wedding',         label: 'Wedding',       emoji: '💍' },
  { id: 'events',          label: 'Events',        emoji: '🎉' },
  { id: 'sports',          label: 'Sports',        emoji: '⚡' },
  { id: 'food',            label: 'Food',          emoji: '🍽️' },
  { id: 'fashion',         label: 'Fashion',       emoji: '👗' },
  { id: 'travel',          label: 'Travel',        emoji: '✈️' },
  { id: 'lifestyle',       label: 'Lifestyle',     emoji: '🌿' },
  { id: 'nature',          label: 'Nature',        emoji: '🌲' },
  { id: 'urban',           label: 'Urban',         emoji: '🏙️' },
  { id: 'documentary',     label: 'Documentary',   emoji: '🎞️' },
  { id: 'music',           label: 'Music',         emoji: '🎵' },
  { id: 'architecture',    label: 'Architecture',  emoji: '🏛️' },

  // ── ANTCPU — brand + sub-brands ───────────────────────────────────────────
  { id: 'antcpu',          label: 'ANTCPU',        emoji: '⚡' },
  { id: 'antcpu-ads',      label: 'ANTCPU ADS',    emoji: '📢' },
  { id: 'antcpu-cloud',    label: 'ANTCPU CLOUD',  emoji: '☁️' },
  { id: 'antcpu-edu',      label: 'ANTCPU EDU',    emoji: '🎓' },
  { id: 'antcpu-coin',     label: 'ANTCPU COIN',   emoji: '🪙' },

  // ── Map of Pi — brand + shop types ───────────────────────────────────────
  { id: 'mapofpi',         label: 'Map of Pi',     emoji: '🗺️' },
  { id: 'mop-food',        label: 'MoP Food',      emoji: '🍎' },
  { id: 'mop-clothing',    label: 'MoP Clothing',  emoji: '👗' },
  { id: 'mop-electronics', label: 'MoP Electronics', emoji: '📱' },
  { id: 'mop-home',        label: 'MoP Home',      emoji: '🏡' },
  { id: 'mop-health',      label: 'MoP Health',    emoji: '💄' },
  { id: 'mop-handmade',    label: 'MoP Handmade',  emoji: '🧶' },
  { id: 'mop-books',       label: 'MoP Books',     emoji: '📚' },
  { id: 'mop-services',    label: 'MoP Services',  emoji: '🔧' },
  { id: 'mop-transport',   label: 'MoP Transport', emoji: '🚗' },

  // ── Amanda Photography — brand + session types ────────────────────────────
  { id: 'amanda',          label: 'Amanda',        emoji: '📸' },
  { id: 'amanda-portrait', label: 'Amanda Portrait', emoji: '🎭' },
  { id: 'amanda-wedding',  label: 'Amanda Wedding', emoji: '💍' },
  { id: 'amanda-events',   label: 'Amanda Events', emoji: '🎉' },

  // ── PiPioneersX ───────────────────────────────────────────────────────────
  { id: 'pipioneers',      label: 'PiPioneersX',   emoji: '🚀' },

];

// Convenience: just the label strings (for dropdowns)
export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);

// Default selection
export const DEFAULT_CATEGORY = CATEGORIES[0].label; // 'Portrait'
