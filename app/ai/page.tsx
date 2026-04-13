// app/ai/page.tsx
'use client'

import { useState, useEffect } from 'react'

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
    writes: null,
    progress: 100,
  },
  {
    id: 'enhance',
    status: 'planned' as const,
    icon: '✦',
    title: 'Auto Enhance',
    desc: 'Auto-tag images by content, generate descriptions, enrich EXIF data, and assign categories — triggered automatically on every upload.',
    href: null,
    eta: 'v0.2',
    tech: 'OpenAI Vision · POST /api/enhance',
    writes: ['tags[]', 'description', 'category', 'exif'],
    progress: 60,
  },
  {
    id: 'describe',
    status: 'planned' as const,
    icon: '≋',
    title: 'Image Describe',
    desc: 'Generate rich alt text, captions, and SEO-ready descriptions from any image. Output feeds directly into asset metadata.',
    href: null,
    eta: 'v0.2',
    tech: 'OpenAI GPT-4o Vision · POST /api/describe',
    writes: ['altText', 'caption', 'seoDescription'],
    progress: 55,
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
    writes: ['rerenderUrl', 'model', 'prompt'],
    progress: 30,
  },
  {
    id: 'background',
    status: 'planned' as const,
    icon: '◻',
    title: 'Background Removal',
    desc: 'One-click background removal for portraits, products, and lifestyle shots. Returns PNG with full transparency preserved.',
    href: null,
    eta: 'v0.3',
    tech: 'Replicate REMBG · POST /api/background',
    writes: ['bgRemovedUrl', 'maskUrl'],
    progress: 25,
  },
  {
    id: 'social',
    status: 'planned' as const,
    icon: '◎',
    title: 'Social Pack',
    desc: 'One image in → full social media pack out. Every platform size generated in a single job, returned as a zip.',
    href: null,
    eta: 'v0.4',
    tech: 'Sharp batch · POST /api/social-pack',
    writes: ['socialPack{}', 'packUrl', 'formats[]'],
    progress: 10,
  },
]

const PIPELINE = [
  { step: '01', label: 'Upload',  desc: 'Image lands in Vercel Blob',        icon: '⬆' },
  { step: '02', label: 'Analyze', desc: 'Vision model reads the image',       icon: '◉' },
  { step: '03', label: 'Enhance', desc: 'Tags, descriptions, EXIF written',   icon: '✦' },
  { step: '04', label: 'Serve',   desc: 'Enriched asset available via API',   icon: '→' },
]

export default function AIHubPage() {
  const ready   = TOOLS.filter(t => t.status === 'ready')
  const planned = TOOLS.filter(t => t.status === 'planned')
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1800)
    return () => clearInterval(id)
  }, [])

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
            AI-powered tools built into the Amanda platform. Every image uploaded gets
            smarter — tagged, described, resized, and ready to serve anywhere via API.
          </p>

          {/* Live status strip */}
          <div style={s.heroStats}>
            <div style={s.heroStat}>
              <span style={{
                ...s.liveDot,
                background: '#c8f564',
                boxShadow: pulse ? '0 0 8px #c8f564' : '0 0 2px #c8f564',
                transition: 'box-shadow 0.6s',
              }} />
              <span style={{ ...s.heroStatText, color: '#c8f564' }}>{ready.length} tool{ready.length !== 1 ? 's' : ''} live</span>
            </div>
            <span style={s.heroSep}>·</span>
            <div style={s.heroStat}>
              <span style={{ ...s.liveDot, background: '#4a4f63' }} />
              <span style={s.heroStatText}>{planned.length} in pipeline</span>
            </div>
            <span style={s.heroSep}>·</span>
            <span style={s.heroStatText}>v0.2 → v0.4 roadmap</span>
          </div>
        </div>
      </div>

      {/* ── Pipeline strip ── */}
      <div style={s.pipelineWrap}>
        <div style={s.pipelineInner}>
          {PIPELINE.map((step, i) => (
            <div key={step.step} style={s.pipelineItem}>
              <div style={s.pipelineIcon}>{step.icon}</div>
              <div style={s.pipelineStep}>{step.step}</div>
              <div style={s.pipelineLabel}>{step.label}</div>
              <div style={s.pipelineDesc}>{step.desc}</div>
              {i < PIPELINE.length - 1 && <div style={s.pipelineArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Ready Tools ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>AVAILABLE NOW</span>
          <span style={{ ...s.sectionSub, color: '#c8f564' }}>● live</span>
        </div>
        <div style={s.grid}>
          {ready.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>

      {/* ── Planned Tools ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>IN THE PIPELINE</span>
          <span style={s.sectionSub}>Each slot is ready to receive code — flip status to 'ready' when built</span>
        </div>
        <div style={s.grid}>
          {planned.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>

      {/* ── Dev note ── */}
      <div style={s.section}>
        <div style={s.devNote}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔧</span>
          <div>
            <div style={s.devNoteTitle}>Adding a new AI tool</div>
            <div style={s.devNoteText}>
              Add an entry to <code style={s.code}>TOOLS[]</code> in <code style={s.code}>app/ai/page.tsx</code> →
              build the API route at <code style={s.code}>app/api/[tool]/route.ts</code> →
              flip <code style={s.code}>status: 'ready'</code> and set <code style={s.code}>href</code>.
              The card goes live automatically.
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
  const isReady = tool.status === 'ready'

  const inner = (
    <div
      style={{
        ...s.card,
        borderColor:  isReady ? 'rgba(200,245,100,0.2)'  : 'rgba(255,255,255,0.06)',
        background:   isReady ? 'rgba(200,245,100,0.03)' : '#12151c',
        opacity:      isReady ? 1 : 0.85,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isReady
          ? 'rgba(200,245,100,0.5)'
          : 'rgba(255,255,255,0.12)'
        if (isReady) e.currentTarget.style.boxShadow = '0 0 20px rgba(200,245,100,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isReady
          ? 'rgba(200,245,100,0.2)'
          : 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div style={s.cardHeader}>
        <span style={s.cardIcon}>{tool.icon}</span>
        <span style={{
          ...s.statusPill,
          color:       isReady ? '#c8f564' : '#4a4f63',
          background:  isReady ? 'rgba(200,245,100,0.08)' : 'transparent',
          borderColor: isReady ? 'rgba(200,245,100,0.2)'  : 'rgba(255,255,255,0.06)',
        }}>
          {isReady ? '● live' : tool.eta}
        </span>
      </div>

      {/* Content */}
      <div style={s.cardTitle}>{tool.title}</div>
      <div style={s.cardDesc}>{tool.desc}</div>

      {/* Writes to asset */}
      {tool.writes && (
        <div style={s.writesRow}>
          <span style={s.writesLabel}>writes →</span>
          {tool.writes.map(w => (
            <span key={w} style={s.writesPill}>{w}</span>
          ))}
        </div>
      )}

      {/* Progress bar for planned */}
      {!isReady && (
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div style={{
              ...s.progressBar,
              width: `${tool.progress}%`,
              background: tool.progress > 50
                ? 'rgba(200,245,100,0.5)'
                : tool.progress > 25
                  ? 'rgba(77,166,255,0.5)'
                  : 'rgba(74,79,99,0.5)',
            }} />
          </div>
          <span style={s.progressLabel}>{tool.progress}%</span>
        </div>
      )}

      {/* Tech */}
      <div style={s.cardTech}>{tool.tech}</div>

      {/* CTA */}
      {isReady && <div style={s.cardCta}>Open tool →</div>}
    </div>
  )

  return tool.href
    ? <a href={tool.href} style={{ textDecoration: 'none' }}>{inner}</a>
    : inner
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root:         { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:       { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  topbarInner:  { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:     { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  nav:          { display: 'flex', gap: 20 },
  navLink:      { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },

  hero:         { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '52px 20px 44px' },
  heroInner:    { maxWidth: 1100, margin: '0 auto' },
  badge:        { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:        { fontSize: 'clamp(28px, 5vw, 48px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 12 },
  sub:          { fontSize: 14, color: '#7c8096', lineHeight: 1.75, maxWidth: 560, marginBottom: 24 },
  heroStats:    { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  heroStat:     { display: 'flex', alignItems: 'center', gap: 6 },
  heroStatText: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096' },
  heroSep:      { fontSize: 11, color: '#2a2f3d' },
  liveDot:      { width: 7, height: 7, borderRadius: '50%', flexShrink: 0, display: 'inline-block' },

  pipelineWrap:  { borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0e1016', padding: '20px' },
  pipelineInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto' },
  pipelineItem:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 120, position: 'relative', padding: '8px 12px' },
  pipelineIcon:  { fontSize: 18, color: '#c8f564', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 },
  pipelineStep:  { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#2a2f3d', letterSpacing: '0.1em' },
  pipelineLabel: { fontSize: 12, fontWeight: 600, color: '#e8eaf0' },
  pipelineDesc:  { fontSize: 10, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace", textAlign: 'center' },
  pipelineArrow: { position: 'absolute', right: -8, top: '38%', fontSize: 12, color: '#2a2f3d', fontFamily: "'IBM Plex Mono', monospace" },

  section:       { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  sectionHeader: { marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 },
  sectionLabel:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63' },
  sectionSub:    { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 },

  card:          { border: '1px solid', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.15s, box-shadow 0.15s', height: '100%', boxSizing: 'border-box' },
  cardHeader:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardIcon:      { fontSize: 22, fontFamily: "'IBM Plex Mono', monospace" },
  statusPill:    { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", border: '1px solid', borderRadius: 20, padding: '2px 8px' },
  cardTitle:     { fontSize: 14, fontWeight: 600, color: '#e8eaf0' },
  cardDesc:      { fontSize: 12, color: '#7c8096', lineHeight: 1.65, flex: 1 },

  writesRow:     { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  writesLabel:   { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#2a2f3d', letterSpacing: '0.1em' },
  writesPill:    { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 6px' },

  progressWrap:  { display: 'flex', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' },
  progressBar:   { height: '100%', borderRadius: 2, transition: 'width 0.4s' },
  progressLabel: { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#2a2f3d', width: 24, textAlign: 'right', flexShrink: 0 },

  cardTech:      { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#2a2f3d', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 },
  cardCta:       { fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564' },

  devNote:       { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  devNoteTitle:  { fontSize: 12, fontWeight: 600, color: '#e8eaf0', marginBottom: 6 },
  devNoteText:   { fontSize: 11, color: '#7c8096', lineHeight: 1.7 },
  code:          { fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', fontSize: 11 },

  footer:        { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px', marginTop: 20 },
  footerInner:   { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerLink:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:           { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
