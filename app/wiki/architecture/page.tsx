// app/wiki/architecture/page.tsx
import Link from 'next/link'

const STACK = [
  {
    layer:   'Frontend',
    color:   '#c8f564',
    items: [
      { name: 'Next.js 15',        desc: 'App Router · Edge Runtime · React Server Components' },
      { name: 'TypeScript',        desc: 'Strict mode · typed throughout' },
      { name: 'Vercel',            desc: 'Deploy · CDN · Edge Functions · Analytics' },
    ],
  },
  {
    layer:   'Storage',
    color:   '#4da6ff',
    items: [
      { name: 'Vercel Blob',       desc: 'Original image files · public CDN URLs · immutable' },
      { name: 'Upstash KV (Redis)',desc: 'Asset metadata · event log · session state · edge-compatible' },
      { name: 'Cloudinary',        desc: 'Image transforms · thumbnails · social pack delivery · CDN' },
    ],
  },
  {
    layer:   'APIs',
    color:   '#34d6a8',
    items: [
      { name: '/api/assets',       desc: 'GET — public asset list with metadata and platform defaults' },
      { name: '/api/search',       desc: 'GET — full-text search across all 20 assets in KV' },
      { name: '/api/upload',       desc: 'POST — Blob + Cloudinary + KV write + Discord notify' },
      { name: '/api/stats',        desc: 'GET — Discord status, event count, last upload, top category' },
      { name: '/api/chat',         desc: 'POST — scripted booking agent, intent matching, fallbacks' },
      { name: '/api/notify',       desc: 'POST — Discord webhook, fires on upload and booking events' },
      { name: '/api/auth',         desc: 'GET/POST/DELETE — cookie-based studio auth, 7-day session' },
      { name: '/api/resize',       desc: 'POST — Cloudinary transform, social media dimension presets' },
    ],
  },
  {
    layer:   'Integrations',
    color:   '#f0a500',
    items: [
      { name: 'Discord Webhook',   desc: 'Every upload fires a notification · booking intents · events' },
      { name: 'Cloudinary CDN',    desc: 'Auto-format · auto-quality · WebP/AVIF · global edge' },
      { name: 'Apple CDN',         desc: 'Equipment images served from Apple store CDN' },
    ],
  },
  {
    layer:   'Auth',
    color:   '#ff5e5e',
    items: [
      { name: 'Cookie auth',       desc: 'upload_token cookie · httpOnly · secure · path: / · 7-day TTL' },
      { name: 'Middleware',        desc: 'matcher: /dashboard/:path* · redirects to /login if no cookie' },
      { name: 'Two profiles',      desc: 'Amanda (@amanda) · antcpu (@antcpu) · single studio key' },
    ],
  },
]

const FLOW = `
  Client browser
       │
       ▼
  antcpu.com/manda/          ← Static HTML · hosted on antcpu.com
  antcpu.com/manda/agent/    ← Static HTML · booking agent UI
       │
       │  fetch() calls
       ▼
  amandaland.vercel.app      ← Next.js 15 App Router on Vercel Edge
       │
       ├── /api/assets        ← Upstash KV read
       ├── /api/search        ← Upstash KV scan
       ├── /api/stats         ← Upstash KV read + Discord ping
       ├── /api/chat          ← Scripted engine · no external AI
       ├── /api/upload        ──┬── Vercel Blob write
       │                        ├── Cloudinary upload
       │                        ├── Upstash KV write
       │                        └── Discord webhook notify
       └── /api/auth          ← Cookie set/verify/delete
`

const DATA_FLOW = `
  Upload flow:
  ─────────────────────────────────────────────────────
  1. Client POSTs image to /api/upload
  2. File written to Vercel Blob → returns blobUrl
  3. File uploaded to Cloudinary → returns cloudinaryId
  4. Metadata written to Upstash KV:
       key: asset:{uuid}
       value: { id, filename, blobUrl, cloudinaryId,
                category, visibility, meta, uploadedAt }
  5. Event written to KV event log
  6. Discord webhook fires with filename + category
  7. Response returns full asset object

  Search flow:
  ─────────────────────────────────────────────────────
  1. GET /api/search?q=portrait
  2. KV scan returns all asset keys
  3. Filter by filename, title, category, EXIF match
  4. Returns { count, results[], defaults{} }

  Booking agent flow:
  ─────────────────────────────────────────────────────
  1. Client POSTs message to /api/chat
  2. Intent matched against keyword banks
  3. Multi-step booking flow tracked per session
  4. Reply returned in < 400ms
  5. On booking completion → /api/notify fires Discord
`

export default function ArchitecturePage() {
  return (
    <div style={s.root}>

      {/* Topbar */}
      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span>ARCH</span>
          <nav style={s.nav}>
            <Link href="/wiki" style={s.navLink}>← Wiki</Link>
            <Link href="/wiki/api" style={s.navLink}>API Docs</Link>
            <Link href="/dashboard" style={s.navLink}>Studio</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>ARCHITECTURE</span>
          <h1 style={s.title}>Stack Overview</h1>
          <p style={s.sub}>
            Next.js 15 · Vercel Edge · Upstash KV · Vercel Blob · Cloudinary · Discord
          </p>
          <div style={s.pillRow}>
            {['Serverless', 'Edge Runtime', 'Zero cold starts', 'Global CDN', 'No database'].map(t => (
              <span key={t} style={s.infoPill}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={s.content}>

        {/* Stack layers */}
        <div style={s.sectionLabel}>STACK</div>
        <div style={s.stackGrid}>
          {STACK.map(layer => (
            <div key={layer.layer} style={s.layerCard}>
              <div style={{ ...s.layerTitle, color: layer.color }}>
                {layer.layer}
              </div>
              <div style={s.layerItems}>
                {layer.items.map(item => (
                  <div key={item.name} style={s.layerItem}>
                    <div style={s.itemName}>{item.name}</div>
                    <div style={s.itemDesc}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System diagram */}
        <div style={s.sectionLabel}>SYSTEM DIAGRAM</div>
        <div style={s.diagramCard}>
          <pre style={s.pre}>{FLOW}</pre>
        </div>

        {/* Data flows */}
        <div style={s.sectionLabel}>DATA FLOWS</div>
        <div style={s.diagramCard}>
          <pre style={s.pre}>{DATA_FLOW}</pre>
        </div>

        {/* Key decisions */}
        <div style={s.sectionLabel}>KEY DECISIONS</div>
        <div style={s.decisionsGrid}>
          {[
            {
              decision: 'Upstash KV over Supabase',
              reason:   'Edge-compatible, zero cold starts, no connection pooling. Asset count is small — KV scan is fast enough. Supabase migration is on the roadmap for v0.4 when query complexity grows.',
            },
            {
              decision: 'Static HTML for public site',
              reason:   'antcpu.com/manda/ is a static HTML file. Fast, no framework overhead, easy to edit. Fetches live data from the Vercel API at runtime via fetch().',
            },
            {
              decision: 'Scripted agent over OpenAI',
              reason:   'Zero API cost, instant responses, fully deterministic. Intent matching covers 95% of booking conversations. OpenAI swap-in is one function call when key is available.',
            },
            {
              decision: 'Cloudinary for transforms',
              reason:   'Vercel Blob stores originals. Cloudinary handles all resizing, format conversion, and CDN delivery. Keeps Blob costs low, leverages Cloudinary free tier.',
            },
            {
              decision: 'Cookie auth over JWT',
              reason:   'httpOnly cookie, 7-day TTL, path: /. Simple, secure, no token refresh logic. Single studio key — not a multi-tenant system.',
            },
            {
              decision: 'Discord as event bus',
              reason:   'Every upload, booking intent, and system event fires a Discord webhook. Free, instant, no infrastructure. Acts as a lightweight audit log and notification system.',
            },
          ].map(d => (
            <div key={d.decision} style={s.decisionCard}>
              <div style={s.decisionTitle}>{d.decision}</div>
              <div style={s.decisionReason}>{d.reason}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA.STUDIO · ARCHITECTURE · 2026</span>
          <Link href="/wiki" style={s.footerLink}>← Back to Wiki</Link>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root:           { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:         { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  inner:          { maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  wordmark:       { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:         { color: '#c8f564' },
  nav:            { display: 'flex', gap: 20 },
  navLink:        { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:           { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 40px' },
  heroInner:      { maxWidth: 1100, margin: '0 auto' },
  badge:          { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:          { fontSize: 'clamp(28px, 5vw, 42px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10, marginTop: 8 },
  sub:            { fontSize: 13, color: '#7c8096', lineHeight: 1.7, marginBottom: 16 },
  pillRow:        { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  infoPill:       { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 10px' },
  content:        { maxWidth: 1100, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 32 },
  sectionLabel:   { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#4a4f63', marginBottom: 14 },
  stackGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 },
  layerCard:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px' },
  layerTitle:     { fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14 },
  layerItems:     { display: 'flex', flexDirection: 'column', gap: 12 },
  layerItem:      { display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' },
  itemName:       { fontSize: 12, fontWeight: 600, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  itemDesc:       { fontSize: 11, color: '#4a4f63', lineHeight: 1.6 },
  diagramCard:    { background: '#0a0c10', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  pre:            { padding: '24px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096', overflowX: 'auto' as const, margin: 0, lineHeight: 1.8, whiteSpace: 'pre' as const },
  decisionsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 },
  decisionCard:   { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 },
  decisionTitle:  { fontSize: 12, fontWeight: 700, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  decisionReason: { fontSize: 11, color: '#7c8096', lineHeight: 1.7 },
  footer:         { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:    { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:     { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:            { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
