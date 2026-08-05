// app/page.tsx
// Amanda.Studio — Splash Dash
// Minimal control surface. Live data. Fast access to everything.
// No marketing copy. No hero image. Just buttons and status.

'use client'

import { useEffect, useState } from 'react'
import { PLATFORM, SEASON, API } from '@/lib/constants'

type Stats = {
  discordConnected: boolean
  totalEvents:      number
  topCategory:      string
  lastEvent?:       { meta?: { filename?: string; category?: string }; timestamp?: string }
}

export default function SplashDash() {
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [assetCount,  setAssetCount]  = useState<number | null>(null)
  const [time,        setTime]        = useState('')
  const [loading,     setLoading]     = useState(true)

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch stats + asset count in parallel
  useEffect(() => {
    Promise.all([
      fetch(API.stats).then(r => r.json()),
      fetch(API.search + '?q=').then(r => r.json()),
    ])
      .then(([s, a]) => {
        setStats(s.status)
        setAssetCount(a.count ?? null)
      })
      .catch(() => setStats({ discordConnected: false, totalEvents: 0, topCategory: '—' }))
      .finally(() => setLoading(false))
  }, [])

  const discord    = stats?.discordConnected ?? false
  const events     = stats?.totalEvents      ?? 0
  const topCat     = stats?.topCategory      ?? '—'
  const lastFile   = stats?.lastEvent?.meta?.filename ?? '—'
  const lastCat    = stats?.lastEvent?.meta?.category ?? ''
  const lastTime   = stats?.lastEvent?.timestamp
    ? new Date(stats.lastEvent.timestamp).toLocaleDateString()
    : '—'

  return (
    <div style={s.root}>

      {/* ── Header strip ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.wordmark}>
            AMANDA<span style={s.dot}>.</span>STUDIO
          </div>
          <div style={s.headerRight}>
            <div style={s.clock}>{time}</div>
            <div style={s.nodePill}>
              <span style={s.nodeDot} />
              NODE 1 · ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main style={s.main}>

        {/* ── Live stat row ── */}
        <div style={s.statRow}>
          <Stat label="Assets"      value={loading ? '···' : String(assetCount ?? 0)} color="#c8f564" />
          <Stat label="Events"      value={loading ? '···' : String(events)}           color="#c8f564" />
          <Stat label="Discord"     value={loading ? '···' : discord ? '✓ Live' : 'Offline'} color={discord ? '#34d6a8' : '#ff5e5e'} />
          <Stat label="Top Cat"     value={loading ? '···' : topCat}                   color="#7c8096" />
          <Stat label="Last Upload" value={loading ? '···' : lastFile.replace(/\.[^/.]+$/, '')} color="#7c8096" sub={lastCat || undefined} />
          <Stat label="Date"        value={loading ? '···' : lastTime}                 color="#7c8096" />
        </div>

        {/* ── Season band ── */}
        <div style={s.seasonBand}>
          <span style={s.seasonIcon}>🍂</span>
          <span style={s.seasonText}>{SEASON.label} · {SEASON.cta}</span>
          <a href="https://antcpu.com/manda/agent/" style={s.seasonBtn} target="_blank" rel="noreferrer">
            Book Now →
          </a>
        </div>

        {/* ── Button grid ── */}
        <div style={s.grid}>

          {/* Row 1 — Primary actions */}
          <DashBtn
            href="/dashboard"
            icon="⬆"
            label="Studio"
            sub="Upload · manage · search"
            accent
            size="large"
          />
          <DashBtn
            href="/dashboard/vault"
            icon="🔒"
            label="Vault"
            sub="Private · partner · release"
            accent
            size="large"
          />
          <DashBtn
            href="https://antcpu.com/manda/agent/"
            icon="💬"
            label="Agent"
            sub="Client booking · chat"
            highlight
            size="large"
            external
          />

          {/* Row 2 — Tools */}
          <DashBtn
            href="/studio"
            icon="⚡"
            label="Resize"
            sub="Social media dimensions"
            size="medium"
          />
          <DashBtn
            href="https://antcpu.com/manda/"
            icon="📸"
            label="Portfolio"
            sub="Public client-facing site"
            size="medium"
            external
          />
          <DashBtn
            href="/dashboard/assets"
            icon="◻"
            label="Assets"
            sub="Browse all uploaded files"
            size="medium"
          />

          {/* Row 3 — Data + Docs */}
          <DashBtn
            href="/api/assets"
            icon="◈"
            label="API"
            sub="/api/assets · JSON"
            size="small"
            mono
          />
          <DashBtn
            href="/api/search?q="
            icon="≋"
            label="Search"
            sub="/api/search · all assets"
            size="small"
            mono
          />
          <DashBtn
            href="/api/stats"
            icon="∿"
            label="Stats"
            sub="/api/stats · live"
            size="small"
            mono
          />
          <DashBtn
            href="/wiki"
            icon="◎"
            label="Wiki"
            sub="Docs · architecture · API ref"
            size="small"
          />
          <DashBtn
            href="/wiki/status"
            icon="●"
            label="Status"
            sub="All systems · live checks"
            size="small"
          />
          <DashBtn
            href="/wiki/roadmap"
            icon="⚡"
            label="Roadmap"
            sub="v0.1 → v0.5 milestones"
            size="small"
          />

        </div>

        {/* ── Platform constants strip ── */}
        <div style={s.constStrip}>
          <ConstItem label="Base URL"     value={PLATFORM.baseUrl}   href={PLATFORM.baseUrl} />
          <ConstItem label="Public Site"  value={PLATFORM.publicSite} href={PLATFORM.publicSite} />
          <ConstItem label="Agent"        value="antcpu.com/manda/agent/" href="https://antcpu.com/manda/agent/" />
          <ConstItem label="Blob Storage" value="w9cysoaxfshj0nmr.public.blob.vercel-storage.com" />
          <ConstItem label="Cloudinary"   value="res.cloudinary.com/dz0zxxd7d · amandaland/" />
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <span style={s.footerText}>AMANDA<span style={s.dot}>.</span>STUDIO · antcpu platform · © 2026</span>
        <a href="https://antcpu.com" style={s.footerLink}>antcpu.com ↗</a>
      </footer>

    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ label, value, color, sub }: {
  label: string
  value: string
  color: string
  sub?:  string
}) {
  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, color }}>{value}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  )
}

// ── Dashboard button ──────────────────────────────────────────────────────────
function DashBtn({ href, icon, label, sub, accent, highlight, size, mono, external }: {
  href:      string
  icon:      string
  label:     string
  sub:       string
  accent?:   boolean
  highlight?: boolean
  size:      'large' | 'medium' | 'small'
  mono?:     boolean
  external?: boolean
}) {
  const base: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    gap:            6,
    padding:        size === 'large' ? '22px 24px' : size === 'medium' ? '18px 20px' : '14px 16px',
    background:     accent    ? 'rgba(200,245,100,0.05)'
                  : highlight ? 'rgba(232,98,26,0.06)'
                  : '#0f1117',
    border:         accent    ? '1px solid rgba(200,245,100,0.2)'
                  : highlight ? '1px solid rgba(232,98,26,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
    borderRadius:   10,
    textDecoration: 'none',
    cursor:         'pointer',
    transition:     'background 0.15s, border-color 0.15s, transform 0.1s',
    gridColumn:     size === 'large' ? 'span 1' : 'span 1',
  }

  return (
    <a
      href={href}
      style={base}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background    = accent    ? 'rgba(200,245,100,0.1)'
                               : highlight ? 'rgba(232,98,26,0.12)'
                               : '#161a24'
        el.style.borderColor   = accent    ? 'rgba(200,245,100,0.4)'
                               : highlight ? 'rgba(232,98,26,0.5)'
                               : 'rgba(255,255,255,0.14)'
        el.style.transform     = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background    = accent    ? 'rgba(200,245,100,0.05)'
                               : highlight ? 'rgba(232,98,26,0.06)'
                               : '#0f1117'
        el.style.borderColor   = accent    ? 'rgba(200,245,100,0.2)'
                               : highlight ? 'rgba(232,98,26,0.25)'
                               : 'rgba(255,255,255,0.06)'
        el.style.transform     = 'translateY(0)'
      }}
    >
      <span style={{
        fontSize:   size === 'large' ? 22 : size === 'medium' ? 18 : 14,
        lineHeight: 1,
      }}>
        {icon}
      </span>
      <span style={{
        fontSize:   size === 'large' ? 14 : size === 'medium' ? 13 : 12,
        fontWeight: 700,
        color:      accent    ? '#c8f564'
                  : highlight ? '#e8621a'
                  : '#e8eaf0',
        fontFamily: mono ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
        letterSpacing: mono ? '0.04em' : 'normal',
      }}>
        {label}
      </span>
      <span style={{
        fontSize:   10,
        color:      '#4a4f63',
        fontFamily: "'IBM Plex Mono', monospace",
        lineHeight: 1.4,
      }}>
        {sub}
      </span>
    </a>
  )
}

// ── Constant item ─────────────────────────────────────────────────────────────
function ConstItem({ label, value, href }: {
  label: string
  value: string
  href?: string
}) {
  const inner = (
    <>
      <span style={s.constLabel}>{label}</span>
      <span style={s.constValue}>{value}</span>
    </>
  )
  return href ? (
    <a href={href} style={s.constItem} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <div style={s.constItem}>{inner}</div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight:   '100vh',
    background:  '#080a0f',
    color:       '#e8eaf0',
    fontFamily:  "'DM Sans', sans-serif",
    fontSize:    13,
    display:     'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background:   'rgba(8,10,15,0.98)',
    position:     'sticky',
    top:          0,
    zIndex:       100,
    backdropFilter: 'blur(12px)',
  },
  headerInner: {
    maxWidth:       1200,
    margin:         '0 auto',
    padding:        '0 24px',
    height:         52,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize:      12,
    fontWeight:    700,
    letterSpacing: '0.2em',
    color:         '#e8eaf0',
    fontFamily:    "'IBM Plex Mono', monospace",
  },
  dot: { color: '#c8f564' },
  headerRight: {
    display:    'flex',
    alignItems: 'center',
    gap:        20,
  },
  clock: {
    fontSize:   11,
    fontFamily: "'IBM Plex Mono', monospace",
    color:      '#4a4f63',
    letterSpacing: '0.06em',
  },
  nodePill: {
    display:       'flex',
    alignItems:    'center',
    gap:           6,
    fontSize:      9,
    fontFamily:    "'IBM Plex Mono', monospace",
    fontWeight:    700,
    letterSpacing: '0.14em',
    color:         '#34d6a8',
    background:    'rgba(52,214,168,0.08)',
    border:        '1px solid rgba(52,214,168,0.2)',
    borderRadius:  20,
    padding:       '4px 10px',
  },
  nodeDot: {
    display:      'inline-block',
    width:        5,
    height:       5,
    borderRadius: '50%',
    background:   '#34d6a8',
    boxShadow:    '0 0 6px #34d6a8',
    animation:    'pulse 2s infinite',
  },

  // Main
  main: {
    flex:      1,
    maxWidth:  1200,
    width:     '100%',
    margin:    '0 auto',
    padding:   '28px 24px',
    display:   'flex',
    flexDirection: 'column',
    gap:       20,
  },

  // Stat row
  statRow: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap:                 10,
  },
  statCard: {
    background:   '#0f1117',
    border:       '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding:      '12px 14px',
    display:      'flex',
    flexDirection:'column',
    gap:          4,
  },
  statLabel: {
    fontSize:      9,
    fontFamily:    "'IBM Plex Mono', monospace",
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color:         '#4a4f63',
  },
  statValue: {
    fontSize:      18,
    fontWeight:    700,
    fontFamily:    "'IBM Plex Mono', monospace",
    letterSpacing: '-0.02em',
    lineHeight:    1,
  },
  statSub: {
    fontSize:   9,
    fontFamily: "'IBM Plex Mono', monospace",
    color:      '#4a4f63',
    marginTop:  2,
  },

  // Season band
  seasonBand: {
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    background:   'rgba(240,165,0,0.06)',
    border:       '1px solid rgba(240,165,0,0.15)',
    borderRadius: 8,
    padding:      '10px 16px',
    flexWrap:     'wrap' as const,
  },
  seasonIcon: { fontSize: 14 },
  seasonText: {
    fontSize:   11,
    fontFamily: "'IBM Plex Mono', monospace",
    color:      '#f0a500',
    flex:       1,
  },
  seasonBtn: {
    fontSize:      10,
    fontWeight:    700,
    fontFamily:    "'IBM Plex Mono', monospace",
    color:         '#f0a500',
    border:        '1px solid rgba(240,165,0,0.3)',
    borderRadius:  4,
    padding:       '4px 12px',
    textDecoration:'none',
    background:    'rgba(240,165,0,0.08)',
    whiteSpace:    'nowrap' as const,
  },

  // Button grid
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 10,
  },

  // Constants strip
  constStrip: {
    display:      'flex',
    gap:          8,
    flexWrap:     'wrap' as const,
    background:   '#0a0c10',
    border:       '1px solid rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding:      '12px 16px',
  },
  constItem: {
    display:        'flex',
    flexDirection:  'column' as const,
    gap:            2,
    padding:        '6px 12px',
    background:     '#0f1117',
    border:         '1px solid rgba(255,255,255,0.05)',
    borderRadius:   6,
    textDecoration: 'none',
    cursor:         'default',
  },
  constLabel: {
    fontSize:      8,
    fontFamily:    "'IBM Plex Mono', monospace",
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color:         '#4a4f63',
  },
  constValue: {
    fontSize:   10,
    fontFamily: "'IBM Plex Mono', monospace",
    color:      '#7c8096',
    wordBreak:  'break-all' as const,
  },

  // Footer
  footer: {
    borderTop:      '1px solid rgba(255,255,255,0.04)',
    padding:        '16px 24px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexWrap:       'wrap' as const,
    gap:            10,
  },
  footerText: {
    fontSize:      10,
    fontFamily:    "'IBM Plex Mono', monospace",
    color:         '#2a2f3d',
    letterSpacing: '0.08em',
  },
  footerLink: {
    fontSize:      10,
    fontFamily:    "'IBM Plex Mono', monospace",
    color:         '#c8f564',
    textDecoration:'none',
  },
}
