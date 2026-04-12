// app/wiki/status/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { PLACEHOLDERS, PLATFORM } from '@/lib/constants'

type Check = {
  label:  string
  status: 'checking' | 'pass' | 'fail' | 'warn'
  detail: string
  url?:   string
}

export default function StatusPage() {
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Landing Page',      status: 'checking', detail: 'Fetching...' },
    { label: 'Dashboard',         status: 'checking', detail: 'Fetching...' },
    { label: 'API /stats',        status: 'checking', detail: 'Fetching...' },
    { label: 'API /assets',       status: 'checking', detail: 'Fetching...' },
    { label: 'API /search',       status: 'checking', detail: 'Fetching...' },
    { label: 'API /placeholders', status: 'checking', detail: 'Fetching...' },
    { label: 'Placeholder Profile', status: 'checking', detail: 'Fetching...' },
    { label: 'Placeholder Banner',  status: 'checking', detail: 'Fetching...' },
    { label: 'Discord Webhook',   status: 'checking', detail: 'Fetching...' },
    { label: 'Public Site',       status: 'checking', detail: 'Fetching...' },
  ])
  const [lastChecked, setLastChecked] = useState<string>('')
  const [assetCount, setAssetCount] = useState<number>(0)
  const [eventCount, setEventCount] = useState<number>(0)

  useEffect(() => {
    runChecks()
  }, [])

  async function runChecks() {
    setLastChecked(new Date().toLocaleTimeString())
    const results: Check[] = []

    // 1. Landing page
    try {
      const r = await fetch('/', { method: 'HEAD' })
      results.push({ label: 'Landing Page', status: r.ok ? 'pass' : 'fail', detail: `HTTP ${r.status}`, url: '/' })
    } catch { results.push({ label: 'Landing Page', status: 'fail', detail: 'Unreachable' }) }

    // 2. Dashboard
    try {
      const r = await fetch('/dashboard', { method: 'HEAD' })
      results.push({ label: 'Dashboard', status: r.ok ? 'pass' : 'fail', detail: `HTTP ${r.status}`, url: '/dashboard' })
    } catch { results.push({ label: 'Dashboard', status: 'fail', detail: 'Unreachable' }) }

    // 3. Stats API
    try {
      const r = await fetch('/api/stats')
      const d = await r.json()
      const discord = d?.status?.discordConnected
      setEventCount(d?.status?.totalEvents ?? 0)
      results.push({
        label: 'API /stats', status: r.ok ? 'pass' : 'fail',
        detail: `Discord: ${discord ? '✓ connected' : '✗ offline'} · ${d?.status?.totalEvents ?? 0} events`,
        url: '/api/stats'
      })
    } catch { results.push({ label: 'API /stats', status: 'fail', detail: 'Error' }) }

    // 4. Assets API
    try {
      const r = await fetch('/api/assets')
      const d = await r.json()
      setAssetCount(d?.count ?? 0)
      results.push({
        label: 'API /assets', status: r.ok ? 'pass' : 'fail',
        detail: `${d?.count ?? 0} assets in KV · defaults: ${d?.defaults ? '✓' : '✗'}`,
        url: '/api/assets'
      })
    } catch { results.push({ label: 'API /assets', status: 'fail', detail: 'Error' }) }

    // 5. Search API
    try {
      const r = await fetch('/api/search?q=test')
      const d = await r.json()
      results.push({
        label: 'API /search', status: r.ok ? 'pass' : 'fail',
        detail: `${d?.count ?? 0} results · defaults included: ${d?.defaults ? '✓' : '✗'}`,
        url: '/api/search?q=test'
      })
    } catch { results.push({ label: 'API /search', status: 'fail', detail: 'Error' }) }

    // 6. Placeholders API
    try {
      const r = await fetch('/api/placeholders?type=profile')
      results.push({
        label: 'API /placeholders', status: r.ok ? 'pass' : 'fail',
        detail: `SVG generator · Content-Type: ${r.headers.get('content-type') ?? 'unknown'}`,
        url: '/api/placeholders?type=profile'
      })
    } catch { results.push({ label: 'API /placeholders', status: 'fail', detail: 'Error' }) }

    // 7. Placeholder profile image (real blob)
    try {
      const r = await fetch(PLACEHOLDERS.profile, { method: 'HEAD' })
      results.push({
        label: 'Placeholder Profile', status: r.ok ? 'pass' : 'warn',
        detail: r.ok ? '✓ Blob URL resolving' : '⚠ Not resolving — check blob storage',
        url: PLACEHOLDERS.profile
      })
    } catch { results.push({ label: 'Placeholder Profile', status: 'warn', detail: 'Could not reach blob URL' }) }

    // 8. Placeholder banner image (real blob)
    try {
      const r = await fetch(PLACEHOLDERS.banner, { method: 'HEAD' })
      results.push({
        label: 'Placeholder Banner', status: r.ok ? 'pass' : 'warn',
        detail: r.ok ? '✓ Blob URL resolving' : '⚠ Not resolving — check blob storage',
        url: PLACEHOLDERS.banner
      })
    } catch { results.push({ label: 'Placeholder Banner', status: 'warn', detail: 'Could not reach blob URL' }) }

    // 9. Discord (via stats)
    try {
      const r = await fetch('/api/stats')
      const d = await r.json()
      const ok = d?.status?.discordConnected === true
      results.push({
        label: 'Discord Webhook', status: ok ? 'pass' : 'warn',
        detail: ok ? '✓ Connected and receiving events' : '⚠ Not connected — check DISCORD_WEBHOOK_URL'
      })
    } catch { results.push({ label: 'Discord Webhook', status: 'fail', detail: 'Error' }) }

    // 10. Public site
    try {
      const r = await fetch('https://antcpu.com/manda', { method: 'HEAD' })
      results.push({
        label: 'Public Site', status: r.ok ? 'pass' : 'fail',
        detail: `antcpu.com/manda · HTTP ${r.status}`,
        url: 'https://antcpu.com/manda'
      })
    } catch { results.push({ label: 'Public Site', status: 'warn', detail: 'CORS blocked — likely fine' }) }

    setChecks(results)
  }

  const passing = checks.filter(c => c.status === 'pass').length
  const failing = checks.filter(c => c.status === 'fail').length
  const warning = checks.filter(c => c.status === 'warn').length

  return (
    <div style={s.root}>

      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>/</span>STATUS</span>
          <nav style={s.nav}>
            <a href="/wiki" style={s.navLink}>← Wiki</a>
            <a href="/dashboard" style={s.navLink}>Studio</a>
          </nav>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>SYSTEM STATUS</span>
          <h1 style={s.title}>Platform Health</h1>
          <p style={s.sub}>Live checks across all APIs, storage, and integrations.</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={s.summaryBar}>
        <div style={s.summaryInner}>
          <div style={s.summaryItem}>
            <span style={{ ...s.dot, background: '#34d6a8' }} />
            <span style={s.summaryText}>{passing} passing</span>
          </div>
          <div style={s.summaryItem}>
            <span style={{ ...s.dot, background: '#ff5e5e' }} />
            <span style={s.summaryText}>{failing} failing</span>
          </div>
          <div style={s.summaryItem}>
            <span style={{ ...s.dot, background: '#f5a623' }} />
            <span style={s.summaryText}>{warning} warnings</span>
          </div>
          <span style={s.sep}>·</span>
          <span style={s.summaryText}>{assetCount} assets · {eventCount} events</span>
          <span style={s.sep}>·</span>
          <span style={s.summaryText}>Checked: {lastChecked}</span>
          <button onClick={runChecks} style={s.refreshBtn}>↻ Refresh</button>
        </div>
      </div>

      {/* Checks */}
      <div style={s.section}>
        <div style={s.sectionLabel}>LIVE CHECKS</div>
        <div style={s.checkList}>
          {checks.map((c) => (
            <div key={c.label} style={s.checkRow}>
              <div style={s.checkLeft}>
                <span style={{ ...s.statusDot, background: c.status === 'pass' ? '#34d6a8' : c.status === 'fail' ? '#ff5e5e' : c.status === 'warn' ? '#f5a623' : '#4a4f63' }} />
                <span style={s.checkLabel}>{c.label}</span>
              </div>
              <div style={s.checkRight}>
                <span style={s.checkDetail}>{c.detail}</span>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" style={s.checkLink}>↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Constants */}
      <div style={s.section}>
        <div style={s.sectionLabel}>PLATFORM CONSTANTS</div>
        <div style={s.constGrid}>
          <ConstRow label="Base URL"      value={PLATFORM.baseUrl} />
          <ConstRow label="Public Site"   value={PLATFORM.publicSite} />
          <ConstRow label="Profile Image" value={PLACEHOLDERS.profile} />
          <ConstRow label="Banner Image"  value={PLACEHOLDERS.banner} />
          <ConstRow label="Thumbnail"     value={PLACEHOLDERS.thumbnail} />
        </div>
      </div>

      {/* Agent Instructions */}
      <div style={s.section}>
        <div style={s.sectionLabel}>FOR AGENTS — HOW TO USE THIS PLATFORM</div>
        <div style={s.agentBox}>
          <div style={s.agentRow}>
            <span style={s.agentMethod}>GET</span>
            <span style={s.agentPath}>/api/assets</span>
            <span style={s.agentDesc}>All assets + platform defaults + placeholder URLs</span>
          </div>
          <div style={s.agentRow}>
            <span style={s.agentMethod}>GET</span>
            <span style={s.agentPath}>/api/search?q=</span>
            <span style={s.agentDesc}>Search assets by filename, category, meta</span>
          </div>
          <div style={s.agentRow}>
            <span style={s.agentMethod}>GET</span>
            <span style={s.agentPath}>/api/stats</span>
            <span style={s.agentDesc}>Platform health — Discord, event count, top category</span>
          </div>
          <div style={s.agentRow}>
            <span style={{ ...s.agentMethod, color: '#f5a623' }}>POST</span>
            <span style={s.agentPath}>/api/upload</span>
            <span style={s.agentDesc}>Upload image → Blob + KV + Discord (requires token)</span>
          </div>
          <div style={s.agentRow}>
            <span style={{ ...s.agentMethod, color: '#f5a623' }}>POST</span>
            <span style={s.agentPath}>/api/auth</span>
            <span style={s.agentDesc}>Login → sets upload_token cookie (7 day session)</span>
          </div>
          <div style={s.agentRow}>
            <span style={s.agentMethod}>GET</span>
            <span style={s.agentPath}>/api/placeholders?type=</span>
            <span style={s.agentDesc}>profile | banner | thumbnail — SVG fallback images</span>
          </div>
        </div>
      </div>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA/PLATFORM · 2026</span>
          <a href="/wiki" style={s.footerLink}>← Back to Wiki</a>
        </div>
      </footer>

    </div>
  )
}

function ConstRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.constRow}>
      <span style={s.constLabel}>{label}</span>
      <span style={s.constValue}>{value}</span>
    </div>
  )
}

const s: Record<string, any> = {
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
  title:        { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10 },
  sub:          { fontSize: 14, color: '#7c8096', lineHeight: 1.7 },
  summaryBar:   { background: '#12151c', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px' },
  summaryInner: { maxWidth: 1100, margin: '0 auto', height: 44, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const },
  summaryItem:  { display: 'flex', alignItems: 'center', gap: 6 },
  dot:          { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  summaryText:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096' },
  sep:          { color: '#4a4f63', fontSize: 11 },
  refreshBtn:   { marginLeft: 'auto', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', color: '#c8f564', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' },
  section:      { maxWidth: 1100, margin: '0 auto', padding: '28px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  sectionLabel: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63', marginBottom: 14 },
  checkList:    { display: 'flex', flexDirection: 'column', gap: 0, background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  checkRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 12 },
  checkLeft:    { display: 'flex', alignItems: 'center', gap: 10 },
  statusDot:    { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  checkLabel:   { fontSize: 12, fontWeight: 500, color: '#e8eaf0' },
  checkRight:   { display: 'flex', alignItems: 'center', gap: 10 },
  checkDetail:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
  checkLink:    { fontSize: 11, color: '#c8f564', textDecoration: 'none' },
  constGrid:    { display: 'flex', flexDirection: 'column', gap: 0, background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  constRow:     { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' },
  constLabel:   { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', letterSpacing: '0.1em' },
  constValue:   { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  agentBox:     { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  agentRow:     { display: 'grid', gridTemplateColumns: '50px 220px 1fr', gap: 16, padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' },
  agentMethod:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: '#34d6a8', letterSpacing: '0.1em' },
  agentPath:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#e8eaf0' },
  agentDesc:    { fontSize: 11, color: '#7c8096' },
  footer:       { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:  { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:   { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:          { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
