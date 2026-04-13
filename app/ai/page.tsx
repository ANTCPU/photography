// app/ai/page.tsx
// AI Hub — landing page for all AI-powered image tools
// Drop new tools here as they're built. Each card = one capability.
'use client'

const TOOLS = [
  {
    id: 'resize',
    status: 'ready' as const,
    icon: '⚡',
    title: 'Resize Engine',
    desc: 'Resize any image to exact social media dimensions. Instagram, X, LinkedIn, TikTok, YouTube and more — all presets built in.',
    href: '/studio',
    eta: null,
    tech: 'Sharp · POST /api/resize',
  },
  {
    id: 'enhance',
    status: 'planned' as const,
    icon: '✦',
    title: 'Auto Enhance',
    desc: 'Auto-tag images by content, generate descriptions, enrich EXIF data, and assign categories — all on upload.',
    href: null,
    eta: 'v0.2',
    tech: 'OpenAI Vision · POST /api/enhance',
  },
  {
    id: 'rerender',
    status: 'planned' as const,
    icon: '◈',
    title: 'AI Rerender',
    desc: 'Upscale, style transfer, and creative rerender. Transform RAW shots into polished outputs using generative models.',
    href: null,
    eta: 'v0.3',
    tech: 'Replicate · fal.ai · POST /api/rerender',
  },
  {
    id: 'background',
    status: 'planned' as const,
    icon: '◻',
    title: 'Background Removal',
    desc: 'One-click background removal for portraits, products, and lifestyle shots. Returns PNG with transparency.',
    href: null,
    eta: 'v0.3',
    tech: 'Replicate REMBG · POST /api/background',
  },
  {
    id: 'describe',
    status: 'planned' as const,
    icon: '≋',
    title: 'Image Describe',
    desc: 'Generate rich alt text, captions, and SEO descriptions from any image. Feeds directly into asset metadata.',
    href: null,
    eta: 'v0.2',
    tech: 'OpenAI GPT-4o Vision · POST /api/describe',
  },
  {
    id: 'social',
    status: 'planned' as const,
    icon: '◎',
    title: 'Social Pack',
    desc: 'One image in → full social media pack out. All platform sizes generated in a single job, zipped for download.',
    href: null,
    eta: 'v0.4',
    tech: 'Sharp batch · POST /api/social-pack',
  },
]

const STATUS_CONFIG = {
  ready:   { label: 'Ready',   color: '#c8f564', bg: 'rgba(200,245,100,0.08)', border: 'rgba(200,245,100,0.2)' },
  planned: { label: 'Planned', color: '#4a4f63', bg: 'transparent',            border: 'rgba(255,255,255,0.06)' },
}

export default function AIHubPage() {
  const ready   = TOOLS.filter(t => t.status === 'ready')
  const planned = TOOLS.filter(t => t.status === 'planned')

  return (
    <div style={s.root}>

      {/* ── Topbar ── */}
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>AMANDA<span style={{ color: '#c8f564' }}>/</span>AI</span>
          <nav style={s.nav}>
            <a href="/"          style={s.navLink}>Platform</a>
            <a href="/dashboard" style={s.navLink}>Dashboard</a>
            <a href="/studio"    style={s.navLink}>Studio</a>
            <a href="/wiki"      style={s.navLink}>Wiki</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>AI TOOLS</span>
          <h1 style={s.title}>Image Intelligence</h1>
          <p style={s.sub}>
            AI-powered tools built into the Amanda platform. Resize, enhance, rerender,
            and describe — every image gets smarter from the moment it's uploaded.
          </p>
          <div style={s.heroMeta}>
            <span style={s.metaPill}>
              <span style={{ color: '#c8f564' }}>●</span> {ready.length} tool{ready.length !== 1 ? 's' : ''} ready
            </span>
            <span style={s.metaPill}>
              <span style={{ color: '#4a4f63' }}>○</span> {planned.length} planned
            </span>
          </div>
        </div>
      </div>

      {/* ── Ready Tools ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>AVAILABLE NOW</span>
        </div>
        <div style={s.grid}>
          {ready.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>

      {/* ── Planned Tools ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>COMING SOON</span>
          <span style={s.sectionSub}>Drop AI code into these slots as each tool is built</span>
        </div>
        <div style={s.grid}>
          {planned.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>

      {/* ── Dev Note ── */}
      <div style={s.section}>
        <div style={s.devNote}>
          <span style={s.devNoteIcon}>🔧</span>
          <div>
            <div style={s.devNoteTitle}>Adding a new AI tool</div>
            <div style={s.devNoteText}>
              Add an entry to the <code style={s.code}>TOOLS</code> array in{' '}
              <code style={s.code}>app/ai/page.tsx</code>, create the API route at{' '}
              <code style={s.code}>app/api/[tool-name]/route.ts</code>, then flip{' '}
              <code style={s.code}>status: 'ready'</code> and add the <code style={s.code}>href</code>.
              That's it.
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA<span style={{ color: '#c8f564' }}>.</span>AI</span>
          <a href="/wiki/roadmap" style={s.footerLink}>View full roadmap →</a>
          <span style={s.dim}>© {new Date().getFullYear()} Antony Ciccone</span>
        </div>
      </footer>

    </div>
  )
}

// ── Tool Card ─────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: typeof TOOLS[0] }) {
  const cfg     = STATUS_CONFIG[tool.status]
  const isReady = tool.status === 'ready'

  const inner = (
    <div
      style={{
        ...s.card,
        borderColor:  isReady ? 'rgba(200,245,100,0.15)' : 'rgba(255,255,255,0.06)',
        background:   isReady ? 'rgba(200,245,100,0.03)' : '#12151c',
        opacity:      isReady ? 1 : 0.7,
        cursor:       isReady ? 'pointer' : 'default',
      }}
      onMouseEnter={e => {
        if (isReady) e.currentTarget.style.borderColor = 'rgba(200,245,100,0.35)'
      }}
      onMouseLeave={e => {
        if (isReady) e.currentTarget.style.borderColor = 'rgba(200,245,100,0.15)'
      }}
    >
      {/* Header row */}
      <div style={s.cardHeader}>
        <span style={s.cardIcon}>{tool.icon}</span>
        <span style={{ ...s.statusPill, color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
          {isReady ? cfg.label : tool.eta}
        </span>
      </div>

      {/* Content */}
      <div style={s.cardTitle}>{tool.title}</div>
      <div style={s.cardDesc}>{tool.desc}</div>

      {/* Tech stack */}
      <div style={s.cardTech}>{tool.tech}</div>

      {/* CTA */}
      {isReady && (
        <div style={s.cardCta}>Open tool →</div>
      )}
    </div>
  )

  return tool.href
    ? <a href={tool.href} style={{ textDecoration: 'none' }}>{inner}</a>
    : inner
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root:        { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },

  // Topbar
  topbar:      { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  topbarInner: { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:    { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  nav:         { display: 'flex', gap: 20 },
  navLink:     { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },

  // Hero
  hero:        { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 40px' },
  heroInner:   { maxWidth: 1100, margin: '0 auto' },
  badge:       { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:       { fontSize: 'clamp(28px, 5vw, 42px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10 },
  sub:         { fontSize: 14, color: '#7c8096', lineHeight: 1.7, maxWidth: 520, marginBottom: 20 },
  heroMeta:    { display: 'flex', gap: 16 },
  metaPill:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096', display: 'flex', alignItems: 'center', gap: 6 },

  // Sections
  section:      { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  sectionHeader:{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63' },
  sectionSub:   { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },

  // Cards
  card:        { border: '1px solid', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.15s', height: '100%', boxSizing: 'border-box' },
  cardHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardIcon:    { fontSize: 20, fontFamily: "'IBM Plex Mono', monospace" },
  statusPill:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", border: '1px solid', borderRadius: 20, padding: '2px 8px' },
  cardTitle:   { fontSize: 14, fontWeight: 600, color: '#e8eaf0' },
  cardDesc:    { fontSize: 12, color: '#7c8096', lineHeight: 1.6, flex: 1 },
  cardTech:    { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 },
  cardCta:     { fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', marginTop: 4 },

  // Dev note
  devNote:     { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  devNoteIcon: { fontSize: 18, flexShrink: 0, marginTop: 2 },
  devNoteTitle:{ fontSize: 12, fontWeight: 600, color: '#e8eaf0', marginBottom: 6 },
  devNoteText: { fontSize: 11, color: '#7c8096', lineHeight: 1.7 },
  code:        { fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', fontSize: 11 },

  // Footer
  footer:      { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px', marginTop: 20 },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerLink:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:         { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
