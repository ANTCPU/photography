// lib/cloudinary.ts
// Cloudinary delivery layer — sits on top of Vercel Blob
// Blob = source of truth (raw originals)
// Cloudinary = delivery, transforms, CDN, AI tools

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export default cloudinary

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME

// ── URL builders ──────────────────────────────────────────────────────────────

// Base delivery URL with any transform string
export function cdnUrl(publicId: string, transforms = 'q_auto,f_auto'): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms}/${publicId}`
}

// Smart thumbnail — face-aware crop, 400x400, auto format
export function thumbUrl(publicId: string): string {
  return cdnUrl(publicId, 'c_fill,g_face,w_400,h_400,q_auto,f_auto')
}

// Social resize — exact platform dimensions
export function socialUrl(publicId: string, w: number, h: number): string {
  return cdnUrl(publicId, `c_fill,w_${w},h_${h},q_auto,f_auto`)
}

// Auto-enhanced version
export function enhanceUrl(publicId: string): string {
  return cdnUrl(publicId, 'e_enhance,q_auto,f_auto')
}

// Background removed — returns PNG
export function bgRemovedUrl(publicId: string): string {
  return cdnUrl(publicId, 'e_background_removal/q_auto')
}
