// app/page.tsx
// Amanda.Studio — Splash Dash
// Minimal control surface. Live data. Fast access to everything.

'use client'

import { useEffect, useState } from 'react'
import { PLATFORM, SEASON, API } from '@/lib/constants'

// ── Pulse animation injected once ────────────────────────────────────────────
const PULSE_CSS = `
@keyframes splashPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.splash-pulse {
  animation: splashPulse 2s ease-in-out infinite;
}
`

type Stats = {
  discordConnected: boolean
  totalEvents:      number
  topCategory:      string
  lastEvent?: {
    meta?: { filename?: string; category?: string }
    timestamp?: string
  }
}

export default function SplashDash() {
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [assetCount, setAssetCount] = useState<number | null>(null)
  const [time,       setTime]       = useState('')
  const [loading,    setLoading]    = useState(true)

  // Live clock
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour:   '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch stats + asset count in parallel
  useEffect(() => {
    Promise.all([
      fetch(API.stats).then(r => r.json()),
      fetch(`${API.search}?q=`).then(r => r.json()),
    ])
      .then(([s, a]) => {
        setStats(s.status ?? null)
        setAssetCount(typeof a.count === 'number' ? a.count : null)
      })
      .catch(() =>
        setStats({ discordConnected: false, totalEvents: 0, topCategory: '—' })
      )
      .finally(() => setLoading(false))
  }, [])

  const discord  = stats?.discordConnected ?? false
  const events   = stats?.totalEvents      ?? 0
  const topCat   = stats?.topCategory      ?? '—'
  const lastFile = (stats?.lastEvent?.meta?.filename ?? '—').replace(/\.[^/.]+$/, '')
  const lastCat  = stats?.lastEvent?.meta?.category ?? ''
  const lastTime = stats?.lastEvent?.timestamp
    ? new Date(stats.lastEvent.timestamp).toLocaleDateString()
    : '—'

  return (
    <>
      {/* Inject pulse keyframe once */}
      <style dangerouslySetInnerHTML={{ __html: PULSE_CSS }} />

      <div style={root}>

        {/* ── Header ── */}
        <header style={header}>
          <div style={headerInner}>
            <div style={wordmark}>
              AMANDA<span style={dot}>.</span>STUDIO
            </div>
            <div style={headerRight}>
              <div style={clock}>{time}</div>
              <div style={nodePill}>
                <span
                  className="splash-pulse"
                  style={nodeDot}
                />
                NODE 1 · ONLINE
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main style={mainWrap}>

          {/* Live stats */}
          <div style={statRow}>
            <Stat label="Assets"      value={loading ? '···' : String(assetCount ?? 0)} color="#c8f564" />
            <Stat label="Events"      value={loading ? '···' : String(events)}           color="#c8f564" />
            <Stat label="Discord"     value={loading ? '···' : discord ? '✓ Live' : 'Offline'} color={discord ? '#34d6a8' : '#ff5e5e'} />
            <Stat label="Top Cat"     value={loading ? '···' : topCat}                   color="#7c8096" />
            <Stat label="Last Upload" value={loading ? '···' : lastFile}                 color="#7c8096" sub={lastCat || undefined} />
            <Stat label="Date"        value={loading ? '···' : lastTime}                 color="#7c8096" />
          </div>

          {/* Season band */}
          <div style={seasonBand}>
            <span style={{ fontSize: 14 }}>🍂</span>
            <span style={seasonText}>{SEASON.label} · {SEASON.cta}</span>
            <a
              href="https://antcpu.com/manda/agent/"
              style={seasonBtn}
              target="_blank"
              rel="noreferrer"
            >
              Book Now →
            </a>
          </div>

          {/* Button grid */}
          <div style={grid}>

            {/* Row 1 — Primary */}
            <DashBtn href="/dashboard"                    icon="⬆"  label="Studio"    sub="Upload · manage · search"      accent />
            <DashBtn href="/dashboard/vault"              icon="🔒" label="Vault"     sub="Private · partner · release"   accent />
            <DashBtn href="https://antcpu.com/manda/agent/" icon="💬" label="Agent"  sub="Client booking · chat"         highlight external />

            {/* Row 2 — Tools */}
            <DashBtn href="/studio"                       icon="⚡"  label="Resize"    sub="Social media dimensions"       />
            <DashBtn href="https://antcpu.com/manda/"     icon="📸" label="Portfolio" sub="Public client-facing site"    external />
            <DashBtn href="/dashboard/assets"             icon="◻"  label="Assets"    sub="Browse all uploaded files"     />

            {/* Row 3 — Data + Docs */}
            <DashBtn href="/api/assets"                   icon="◈"  label="API"       sub="/api/assets · JSON"            mono small />
            <DashBtn href="/api/search?q="                icon="≋"  label="Search"    sub="/api/search · all assets"      mono small />
            <DashBtn href="/api/stats"                    icon="∿"  label="Stats"     sub="/api/stats · live"             mono small />
            <DashBtn href="/wiki"                         icon="◎"  label="Wiki"      sub="Docs · architecture · API ref" small />
            <DashBtn href="/wiki/status"                  icon="●"  label="Status"    sub="All systems · live checks"     small />
            <DashBtn href="/wiki/roadmap"                 icon="⚡"  label="Roadmap"   sub="v0.1 → v0.5 milestones"       small />

          </div>

          {/* Constants strip */}
          <div style={constStrip}>
            <ConstItem label="Base URL"     value={PLATFORM.baseUrl}    href={PLATFORM.baseUrl} />
            <ConstItem label="Public Site"  value={PLATFORM.publicSite} href={PLATFORM.publicSite} />
            <ConstItem label="Agent"        value="antcpu.com/manda/agent/" href="https://antcpu.com/manda/agent/" />
            <ConstItem label="Blob"         value="w9cysoaxfshj0nmr.public.blob.vercel-storage.com" />
            <ConstItem label="Cloudinary"   value="res.cloudinary.com/dz0zxxd7d · amandaland/" />
          </div>

        </main>

        {/* ── Footer ── */}
        <footer style={footerWrap}>
          <span style={footerText}>
            AMANDA<span style={dot}>.</span>STUDIO · antcpu platform · © 2026
          </span>
          <a href="https://antcpu.com" style={footerLink}>antcpu.com ↗</a>
        </footer>

      </div>
    </>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────────────
function Stat({ label, value, color, sub }: {
  label: string; value: string; color: string; sub?: string
}) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={{ ...statValue, color }}>{value}</div>
      {sub && <div style={statSub}>{sub}</div>}
    </div>
  )
}

// ── DashBtn ───────────────────────────────────────────────────────────────────
function DashBtn({ href, icon, label, sub, accent, highlight, mono, small, external }: {
  href:      string
  icon:      string
  label:     string
  sub:       string
  accent?:   boolean
  highlight?: boolean
  mono?:     boolean
  small?:    boolean
  external?: boolean
}) {
  const bg     = accent ? 'rgba(200,245,100,0.05)' : highlight ? 'rgba(232,98,26,0.06)' : '#0f1117'
  const border = accent ? '1px solid rgba(200,245,100,0.2)' : highlight ? '1px solid rgba(232,98,26,0.25)' : '1px solid rgba(255,255,255,0.06)'
  const pad    = small  ? '14px 16px' : '20px 22px'
  const lblCol = accent ? '#c8f564' : highlight ? '#e8621a' : '#e8eaf0'
  const iconSz = small  ? 14 : 20

  const [hovered, setHovered] = useState(false)

  const hoverBg     = accent ? 'rgba(200,245,100,0.1)' : highlight ? 'rgba(232,98,26,0.12)' : '#161a24'
  const hoverBorder = accent ? 'rgba(200,245,100,0.4)' : highlight ? 'rgba(232,98,26,0.5)'  : 'rgba(255,255,255,0.14)'

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        flexDirection:  'column',
        gap:            6,
        padding:        pad,
        background:     hovered ? hoverBg     : bg,
        border:         hovered ? `1px solid ${hoverBorder}` : border,
        borderRadius:   10,
        textDecoration: 'none',
        cursor:         'pointer',
        transition:     'background 0.15s, border-color 0.15s, transform 0.1s',
        transform:      hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span style={{ fontSize: iconSz, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize:      small ? 11 : 13,
        fontWeight:    700,
        color:         lblCol,
        fontFamily:    mono ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
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

// ── ConstItem ─────────────────────────────────────────────────────────────────
function ConstItem({ label, value, href }: {
  label: string; value: string; href?: string
}) {
  const inner = (
    <>
      <span style={constLabel}>{label}</span>
      <span style={constValue}>{value}</span>
    </>
  )
  return href ? (
    <a href={href} style={{ ...constItem, cursor: 'pointer' }} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <div style={constItem}>{inner}</div>
  )
}

// ── Styles — individual objects avoid Record<string,CSSProperties> type loss ──

const root: React.CSSProperties = {
  minHeight:     '100vh',
  background:    '#080a0f',
  color:         '#e8eaf0',
  fontFamily:    "'DM Sans', sans-serif",
  fontSize:      13,
  display:       'flex',
  flexDirection: 'column',
}

const header: React.CSSProperties = {
  borderBottom:   '1px solid rgba(255,255,255,0.06)',
  background:     'rgba(8,10,15,0.98)',
  position:       'sticky',
  top:            0,
  zIndex:         100,
  backdropFilter: 'blur(12px)',
}

const headerInner: React.CSSProperties = {
  maxWidth:       1200,
  margin:         '0 auto',
  padding:        '0 24px',
  height:         52,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
}

const wordmark: React.CSSProperties = {
  fontSize:      12,
  fontWeight:    700,
  letterSpacing: '0.2em',
  color:         '#e8eaf0',
  fontFamily:    "'IBM Plex Mono', monospace",
}

const dot: React.CSSProperties = { color: '#c8f564' }

const headerRight: React.CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  gap:        20,
}

const clock: React.CSSProperties = {
  fontSize:      11,
  fontFamily:    "'IBM Plex Mono', monospace",
  color:         '#4a4f63',
  letterSpacing: '0.06em',
}

const nodePill: React.CSSProperties = {
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
}

const nodeDot: React.CSSProperties = {
  display:      'inline-block',
  width:        5,
  height:       5,
  borderRadius: '50%',
  background:   '#34d6a8',
  boxShadow:    '0 0 6px #34d6a8',
  flexShrink:   0,
}

const mainWrap: React.CSSProperties = {
  flex:          1,
  maxWidth:      1200,
  width:         '100%',
  margin:        '0 auto',
  padding:       '28px 24px',
  display:       'flex',
  flexDirection: 'column',
  gap:           20,
}

const statRow: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap:                 10,
}

const statCard: React.CSSProperties = {
  background:    '#0f1117',
  border:        '1px solid rgba(255,255,255,0.06)',
  borderRadius:  8,
  padding:       '12px 14px',
  display:       'flex',
  flexDirection: 'column',
  gap:           4,
}

const statLabel: React.CSSProperties = {
  fontSize:      9,
  fontFamily:    "'IBM Plex Mono', monospace",
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         '#4a4f63',
}

const statValue: React.CSSProperties = {
  fontSize:      18,
  fontWeight:    700,
  fontFamily:    "'IBM Plex Mono', monospace",
  letterSpacing: '-0.02em',
  lineHeight:    1,
}

const statSub: React.CSSProperties = {
  fontSize:   9,
  fontFamily: "'IBM Plex Mono', monospace",
  color:      '#4a4f63',
  marginTop:  2,
}

const seasonBand: React.CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  gap:          12,
  background:   'rgba(240,165,0,0.06)',
  border:       '1px solid rgba(240,165,0,0.15)',
  borderRadius: 8,
  padding:      '10px 16px',
  flexWrap:     'wrap',
}

const seasonText: React.CSSProperties = {
  fontSize:   11,
  fontFamily: "'IBM Plex Mono', monospace",
  color:      '#f0a500',
  flex:       1,
}

const seasonBtn: React.CSSProperties = {
  fontSize:       10,
  fontWeight:     700,
  fontFamily:     "'IBM Plex Mono', monospace",
  color:          '#f0a500',
  border:         '1px solid rgba(240,165,0,0.3)',
  borderRadius:   4,
  padding:        '4px 12px',
  textDecoration: 'none',
  background:     'rgba(240,165,0,0.08)',
  whiteSpace:     'nowrap',
}

const grid: React.CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap:                 10,
}

const constStrip: React.CSSProperties = {
  display:      'flex',
  gap:          8,
  flexWrap:     'wrap',
  background:   '#0a0c10',
  border:       '1px solid rgba(255,255,255,0.04)',
  borderRadius: 8,
  padding:      '12px 16px',
}

const constItem: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  gap:            2,
  padding:        '6px 12px',
  background:     '#0f1117',
  border:         '1px solid rgba(255,255,255,0.05)',
  borderRadius:   6,
  textDecoration: 'none',
  cursor:         'default',
}

const constLabel: React.CSSProperties = {
  fontSize:      8,
  fontFamily:    "'IBM Plex Mono', monospace",
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         '#4a4f63',
}

const constValue: React.CSSProperties = {
  fontSize:   10,
  fontFamily: "'IBM Plex Mono', monospace",
  color:      '#7c8096',
  wordBreak:  'break-all',
}

const footerWrap: React.CSSProperties = {
  borderTop:      '1px solid rgba(255,255,255,0.04)',
  padding:        '16px 24px',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  flexWrap:       'wrap',
  gap:            10,
}

const footerText: React.CSSProperties = {
  fontSize:      10,
  fontFamily:    "'IBM Plex Mono', monospace",
  color:         '#2a2f3d',
  letterSpacing: '0.08em',
}

const footerLink: React.CSSProperties = {
  fontSize:       10,
  fontFamily:     "'IBM Plex Mono', monospace",
  color:          '#c8f564',
  textDecoration: 'none',
}
