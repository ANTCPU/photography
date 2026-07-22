// lib/categories.ts
// ── Single source of truth for categories ──
// To add/remove: edit this file only.
// Future: swap getCategories() to read from KV — nothing else changes.

export type Category = {
  id:    string;
  label: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  // ── Photography ───────────────────────────────────────────────────────────
  { id: 'food',          label: 'Food',          emoji: '🍽️' },
  { id: 'travel',        label: 'Travel',        emoji: '✈️' },
  { id: 'lifestyle',     label: 'Lifestyle',     emoji: '🌿' },
  { id: 'nature',        label: 'Nature',        emoji: '🌲' },
  { id: 'urban',         label: 'Urban',         emoji: '🏙️' },
  { id: 'events',        label: 'Events',        emoji: '🎉' },
  { id: 'fashion',       label: 'Fashion',       emoji: '👗' },
  { id: 'sports',        label: 'Sports',        emoji: '⚡' },
  { id: 'documentary',   label: 'Documentary',   emoji: '🎞️' },
  { id: 'music',         label: 'Music',         emoji: '🎵' },
  { id: 'architecture',  label: 'Architecture',  emoji: '🏛️' },
  { id: 'portrait',      label: 'Portrait',      emoji: '🎭' },

  // ── Map of Pi — partner shop types (private, admin-controlled) ────────────
  { id: 'mapofpi',       label: 'MapOfPi',       emoji: '🗺️' },
  { id: 'mop-food',      label: 'MoP Food',      emoji: '🍎' },
  { id: 'mop-clothing',  label: 'MoP Clothing',  emoji: '👗' },
  { id: 'mop-electronics', label: 'MoP Electronics', emoji: '📱' },
  { id: 'mop-home',      label: 'MoP Home',      emoji: '🏡' },
  { id: 'mop-health',    label: 'MoP Health',    emoji: '💄' },
  { id: 'mop-handmade',  label: 'MoP Handmade',  emoji: '🧶' },
  { id: 'mop-books',     label: 'MoP Books',     emoji: '📚' },
  { id: 'mop-services',  label: 'MoP Services',  emoji: '🔧' },
  { id: 'mop-transport', label: 'MoP Transport', emoji: '🚗' },

  // ── Private events (admin-controlled) ─────────────────────────────────────
  { id: 'wedding',       label: 'Wedding',       emoji: '💍' },
];

// Convenience: just the label strings (for dropdowns)
export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);

// Default selection
export const DEFAULT_CATEGORY = CATEGORIES[0].label; // 'Food'
