// app/wiki/page.tsx
'use client'

export default function WikiIndex() {
  return (
    <div style={s.root}>
      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span></span>
          <nav style={s.nav}>
            <a href="/"          style={s.navLink}>Platform</a>
            <a href="/dashboard" style={s.navLink}>Dashboard</a>
            <a href="/ai"        style={s.navLink}>AI</a>
            <a href="/studio"    style={s.navLink}>Studio</a>
          </nav>
        </div>
      </header>

      <div style={s.hero}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <span style={s.badge}>DOCUMENTATION</span>
          <h1 style={s.title}>Docs & Wiki</h1>
          <p style={s.sub}>Architecture, API reference, AI tools, and project roadmap.</p>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.grid}>
          <WikiCard href="/wiki/roadmap"   icon="⚡" title="Roadmap"        desc="Milestone path from v0.1 to v0.5 — what's built, what's next, and what's planned." />
          <WikiCard href="/wiki/status"    icon="◎" title="System Status"   desc="Live health checks across all APIs, storage, Discord, and integrations." />
          <WikiCard href="/ai"             icon="🤖" title="AI Tools"        desc="All AI-powered image tools — resize, enhance, rerender, describe. Pipeline view." />
          <WikiCard href="/studio"         icon="⚡" title="Resize Engine"   desc="Social media resize tool — all platform presets built in. Sharp-powered." />
          <WikiCard href="/api/assets"     icon="◈" title="API — Assets"    desc="GET /api/assets — returns all stored images with metadata and platform defaults." />
          <WikiCard href="/api/search?q="  icon="≋" title="API — Search"    desc="GET /api/search?q= — search assets by filename, category, EXIF, or Blob path." />
          <WikiCard href="/wiki/api"       icon="⬡" title="API Reference"   desc="Full endpoint docs — search, upload, notify, stats. Request/response examples." />
          <WikiCard href="/wiki/architecture" icon="◻" title="Architecture" desc="Stack overview — Next.js 14, Vercel Blob, Upstash KV, Discord webhook, middleware." />
        </div>
      </div>

      <footer style={s.footer}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <a href="https://antcpu.com/manda" style={s.footerLink}>antcpu.com/manda ↗</a>
          <span style={s.dim}>© {new Date().getFullYear()} Antony Ciccone</span>
        </div>
      </footer>
    </div>
  )
}

function WikiCard({ href, icon, title, desc }: {
  href: string; icon: string; title: string; desc: string
}) {
  return (
    <a
      href={href}
      style={s.card}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(200,245,100,0.25)'
        e.currentTarget.style.background  = '#191d27'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.background  = '#12151c'
      }}
    >
      <span style={s.icon}>{icon}</span>
      <span style={s.cardTitle}>{title}</span>
      <span style={s.cardDesc}>{desc}</span>
      <span style={s.arrow}>→</span>
    </a>
  )
}

const s: Record<string, React.CSSProperties> = {
  root:      { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:    { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  inner:     { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:  { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:    { color: '#c8f564' },
  nav:       { display: 'flex', gap: 20 },
  navLink:   { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:      { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 40px' },
  badge:     { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:     { fontSize: 'clamp(28px, 5vw, 42px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10 },
  sub:       { fontSize: 14, color: '#7c8096', lineHeight: 1.7 },
  section:   { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer' },
  icon:      { fontSize: 20, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#e8eaf0' },
  cardDesc:  { fontSize: 11, color: '#7c8096', lineHeight: 1.6, flex: 1 },
  arrow:     { fontSize: 12, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
  footer:    { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px', marginTop: 20 },
  footerLink:{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:       { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
