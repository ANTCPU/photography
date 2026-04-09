// lib/categories.ts
// ── Single source of truth for categories ──
// To add/remove: edit this file only.
// Future: swap getCategories() to read from KV — nothing else changes.

export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { id: 'food',         label: 'Food',         emoji: '🍽️' },
  { id: 'travel',       label: 'Travel',        emoji: '✈️' },
  { id: 'lifestyle',    label: 'Lifestyle',     emoji: '🌿' },
  { id: 'nature',       label: 'Nature',        emoji: '🌲' },
  { id: 'urban',        label: 'Urban',         emoji: '🏙️' },
  { id: 'events',       label: 'Events',        emoji: '🎉' },
  { id: 'fashion',      label: 'Fashion',       emoji: '👗' },
  { id: 'sports',       label: 'Sports',        emoji: '⚡' },
  { id: 'documentary',  label: 'Documentary',   emoji: '🎞️' },
  { id: 'music',        label: 'Music',         emoji: '🎵' },
  { id: 'architecture', label: 'Architecture',  emoji: '🏛️' },
  { id: 'portrait',     label: 'Portrait',      emoji: '🎭' },
];

// Convenience: just the label strings (for the <select> dropdown)
export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);

// Default selection
export const DEFAULT_CATEGORY = CATEGORIES[0].label; // 'Food'
