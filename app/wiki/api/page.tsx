// app/wiki/api/page.tsx
'use client'

import Link from 'next/link'

const ENDPOINTS = [
  {
    method:  'GET',
    path:    '/api/assets',
    desc:    'Returns all public assets with metadata and platform defaults.',
    params:  [
      { name: 'visibility', type: 'string', default: 'public', desc: 'Filter by visibility: public · private · partner · all (auth required for non-public)' },
      { name: 'category',   type: 'string', default: 'null',   desc: 'Filter by category name e.g. Lifestyle, Sports, MapOfPi' },
      { name: 'partner',    type: 'string', default: 'null',   desc: 'Filter by partner key e.g. mapofpi, wedding' },
    ],
    response: `{
  "platform": {
    "name": "Amanda Photography",
    "baseUrl": "https://amandaland.vercel.app",
    "publicSite": "https://antcpu.com/manda"
  },
  "defaults": {
    "profile":   "https://...blob.../Portrait/profile.png",
    "banner":    "https://...blob.../Lifestyle/fall-banner.png",
    "thumbnail": "https://...blob.../Portrait/profile.png"
  },
  "count": 7,
  "assets": [
    {
      "id":           "e414d80c-...",
      "filename":     "shop.jpg",
      "category":     "MapOfPi",
      "visibility":   "public",
      "partner":      null,
      "status":       "draft",
      "cloudinaryId": "amandaland/MapOfPi/shop",
      "thumbnailUrl": "https://res.cloudinary.com/.../amandaland/MapOfPi/shop",
      "priceUsd":     null,
      "antcoin":      null,
      "meta":         "0.1 MB · image/jpeg",
      "uploadedAt":   "2026-07-22T02:08:25.736Z",
      "updatedAt":    "2026-07-22T17:48:16.122Z"
    }
  ],
  "_meta": { "filter": "public", "category": null }
}`,
    auth: false,
  },
  {
    method:  'GET',
    path:    '/api/search',
    desc:    'Search all assets by filename, title, category, or EXIF data.',
    params:  [
      { name: 'q', type: 'string', default: '""', desc: 'Search query. Empty string returns all assets.' },
    ],
    response: `{
  "query":   "",
  "count":   20,
  "results": [
    {
      "id":           "44c75ab1-...",
      "filename":     "fall-banner.png",
      "title":        "fall-banner",
      "category":     "Lifestyle",
      "status":       "draft",
      "blobUrl":      "https://...blob.../Lifestyle/fall-banner.png",
      "thumbnailUrl": "https://res.cloudinary.com/.../amandaland/Lifestyle/fall-banner",
      "meta":         "1.1 MB · image/png",
      "uploadedAt":   "2026-08-05T03:47:19.397Z"
    }
  ],
  "defaults": {
    "banner": "https://...blob.../Lifestyle/fall-banner.png"
  }
}`,
    auth: false,
  },
  {
    method:  'GET',
    path:    '/api/stats',
    desc:    'Returns platform health — Discord status, event count, last upload, top category.',
    params:  [],
    response: `{
  "status": {
    "discordConnected": true,
    "totalEvents":      26,
    "topCategory":      "Food",
    "lastEvent": {
      "id":        "cdd5364a-...",
      "type":      "upload_complete",
      "label":     "upload complete",
      "meta": {
        "filename":   "fall-banner.png",
        "category":   "Lifestyle",
        "visibility": "private",
        "size":       "1.1 MB"
      },
      "timestamp": "2026-08-05T03:47:19.796Z"
    }
  },
  "recentEvents": [ ... ]
}`,
    auth: false,
  },
  {
    method:  'POST',
    path:    '/api/chat',
    desc:    'Amanda booking agent. Scripted conversation engine — no OpenAI dependency. Returns a warm reply based on intent matching.',
    params:  [
      { name: 'message', type: 'string', default: 'required', desc: 'User message text' },
      { name: 'system',  type: 'string', default: 'null',     desc: 'Optional system prompt override' },
    ],
    response: `// Request:
{
  "message": "I want to book a portrait session"
}

// Response:
{
  "reply": "I'd love that! What type of session are you thinking — portrait, lifestyle, sports, events, or something else? 📸"
}`,
    auth: false,
  },
  {
    method:  'POST',
    path:    '/api/upload',
    desc:    'Upload an image to Vercel Blob + Cloudinary. Stores metadata in Upstash KV. Fires Discord notification.',
    params:  [
      { name: 'file',       type: 'File',   default: 'required', desc: 'Image file — multipart/form-data' },
      { name: 'category',   type: 'string', default: 'required', desc: 'Category name e.g. Lifestyle, Sports' },
      { name: 'visibility', type: 'string', default: 'private',  desc: 'public · private · partner' },
      { name: 'partner',    type: 'string', default: 'null',     desc: 'Partner key if visibility is partner' },
    ],
    response: `{
  "success":  true,
  "asset": {
    "id":           "uuid-...",
    "filename":     "photo.jpg",
    "blobUrl":      "https://...blob.../photo.jpg",
    "cloudinaryId": "amandaland/Lifestyle/photo",
    "thumbnailUrl": "https://res.cloudinary.com/.../amandaland/Lifestyle/photo",
    "category":     "Lifestyle",
    "visibility":   "private",
    "uploadedAt":   "2026-08-05T..."
  }
}`,
    auth: true,
  },
  {
    method:  'PATCH',
    path:    '/api/assets/:id',
    desc:    'Update asset visibility or partner assignment. Auth required.',
    params:  [
      { name: 'visibility', type: 'string', default: 'required', desc: 'public · private · partner' },
      { name: 'partner',    type: 'string', default: 'null',     desc: 'Partner key — required when visibility is partner' },
    ],
    response: `{
  "success": true,
  "updated": {
    "id":         "uuid-...",
    "visibility": "public",
    "releasedAt": "2026-08-05T..."
  }
}`,
    auth: true,
  },
  {
    method:  'DELETE',
    path:    '/api/assets/:id',
    desc:    'Remove asset from KV store. Does not delete from Blob or Cloudinary.',
    params:  [],
    response: `{
  "success": true,
  "removed": {
    "id":       "uuid-...",
    "filename": "photo.jpg"
  }
}`,
    auth: true,
  },
  {
    method:  'POST',
    path:    '/api/notify',
    desc:    'Fire a Discord webhook notification. Used internally by upload and agent flows.',
    params:  [
      { name: 'type',    type: 'string', default: 'required', desc: 'Event type e.g. upload_complete, booking_intent' },
      { name: 'message', type: 'string', default: 'required', desc: 'Notification message body' },
      { name: 'meta',    type: 'object', default: 'null',     desc: 'Optional metadata object' },
    ],
    response: `{ "success": true, "eventId": "uuid-..." }`,
    auth: true,
  },
]

const METHOD_COLOR: Record<string, string> = {
  GET:    '#34d6a8',
  POST:   '#4da6ff',
  PATCH:  '#f0a500',
  DELETE: '#ff5e5e',
}

export default function ApiReferencePage() {
  return (
    <div style={s.root}>

      {/* Topbar */}
      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span>API</span>
          <nav style={s.nav}>
            <Link href="/wiki" style={s.navLink}>← Wiki</Link>
            <Link href="/api/assets" style={s.navLink}>Live API ↗</Link>
            <Link href="/dashboard" style={s.navLink}>Studio</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>API REFERENCE</span>
          <h1 style={s.title}>Endpoint Docs</h1>
          <p style={s.sub}>
            All endpoints are serverless Edge functions on Vercel.
            Base URL: <code style={s.code}>https://amandaland.vercel.app</code>
          </p>
          <div style={s.pillRow}>
            {['Edge Runtime', 'CORS: *', 'JSON responses', 'Upstash KV', 'Vercel Blob'].map(t => (
              <span key={t} style={s.infoPill}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div style={s.section}>
        {ENDPOINTS.map((ep, i) => (
          <div key={i} style={s.endpoint}>

            {/* Method + path */}
            <div style={s.epHeader}>
              <span style={{ ...s.method, color: METHOD_COLOR[ep.method] ?? '#e8eaf0' }}>
                {ep.method}
              </span>
              <code style={s.path}>{ep.path}</code>
              {ep.auth && (
                <span style={s.authBadge}>🔐 auth required</span>
              )}
            </div>

            {/* Description */}
            <p style={s.epDesc}>{ep.desc}</p>

            {/* Params */}
            {ep.params.length > 0 && (
              <div style={s.paramBlock}>
                <div style={s.blockLabel}>Parameters</div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Name', 'Type', 'Default', 'Description'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ep.params.map(p => (
                      <tr key={p.name} style={s.tr}>
                        <td style={s.td}><code style={s.paramName}>{p.name}</code></td>
                        <td style={s.td}><span style={s.paramType}>{p.type}</span></td>
                        <td style={s.td}><code style={s.paramDefault}>{p.default}</code></td>
                        <td style={s.td}><span style={s.paramDesc}>{p.desc}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Response */}
            <div style={s.responseBlock}>
              <div style={s.blockLabel}>Response</div>
              <pre style={s.pre}>{ep.response}</pre>
            </div>

          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA.STUDIO · API REFERENCE · 2026</span>
          <Link href="/wiki" style={s.footerLink}>← Back to Wiki</Link>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root:         { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:       { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  inner:        { maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  wordmark:     { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:       { color: '#c8f564' },
  nav:          { display: 'flex', gap: 20 },
  navLink:      { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:         { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 40px' },
  heroInner:    { maxWidth: 1100, margin: '0 auto' },
  badge:        { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:        { fontSize: 'clamp(28px, 5vw, 42px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10, marginTop: 8 },
  sub:          { fontSize: 13, color: '#7c8096', lineHeight: 1.7, marginBottom: 16 },
  code:         { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#c8f564', background: 'rgba(200,245,100,0.08)', padding: '1px 6px', borderRadius: 4 },
  pillRow:      { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  infoPill:     { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 10px' },
  section:      { maxWidth: 1100, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 24 },
  endpoint:     { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' },
  epHeader:     { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' as const },
  method:       { fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', minWidth: 52 },
  path:         { fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: '#e8eaf0', flex: 1 },
  authBadge:    { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#f0a500', background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: 4, padding: '2px 8px' },
  epDesc:       { fontSize: 12, color: '#7c8096', padding: '14px 20px 0', lineHeight: 1.7, margin: 0 },
  paramBlock:   { padding: '16px 20px 0' },
  blockLabel:   { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#4a4f63', marginBottom: 10 },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  th:           { padding: '8px 12px', fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#4a4f63', textAlign: 'left' as const, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr:           { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td:           { padding: '8px 12px', verticalAlign: 'top' as const },
  paramName:    { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#c8f564' },
  paramType:    { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#4da6ff' },
  paramDefault: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#4a4f63' },
  paramDesc:    { fontSize: 11, color: '#7c8096', lineHeight: 1.6 },
  responseBlock:{ padding: '16px 20px 20px' },
  pre:          { background: '#0a0c10', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '16px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096', overflowX: 'auto' as const, margin: 0, lineHeight: 1.6 },
  footer:       { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:  { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:   { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:          { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
