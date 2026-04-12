// app/dashboard/page.tsx
'use client'

import { useDashboard } from './context/DashboardContext'
import UploadZone from './components/UploadZone'
import SearchPanel from './components/SearchPanel'
import { CATEGORIES } from '@/lib/categories'

function CategoryPanel() {
  return (
    <div style={p.panel}>
      <PanelLabel>📂 Categories</PanelLabel>
      <div style={p.catGrid}>
        {CATEGORIES.map((c) => (
          <div key={c.label} style={p.catCard}>
            <span style={p.catEmoji}>{c.emoji}</span>
            <span style={p.catLabel}>{c.label}</span>
            <span style={p.catSoon}>coming soon</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      style={p.navBtn}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(200,245,100,0.3)'
        e.currentTarget.style.color = '#c8f564'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = '#e8eaf0'
      }}
    >
      {label}
    </a>
  )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={p.panelLabel}>{children}</div>
  )
}

export default function DashboardPage() {
  return (
    <div style={p.root}>

      {/* ── Nav ── */}
      <div style={p.topnav}>
        <span style={p.topnavLabel}>JUMP TO →</span>
        <NavButton label="📁 Image Dashboard" href="/dashboard/assets" />
        <NavButton label="⚙️ API Explorer"    href="/api/search?q=test" />
        <NavButton label="🗄️ KV Store"        href="https://vercel.com/antcpu/amandaland/stores" />
        <NavButton label="🚀 Deployments"     href="https://vercel.com/antcpu/amandaland" />
        <NavButton label="↗ Live Site"        href="https://antcpu.com/manda" />
        <NavButton label="⚡ Roadmap"         href="/wiki/roadmap" />
        <NavButton label="✦ AI Studio"        href="/studio" />
      </div>

      {/* ── Main ── */}
      <div style={p.main}>

        {/* ── Image Operations — HERO ── */}
        <div style={p.panel}>
          <PanelLabel>Image Operations</PanelLabel>

          <div style={p.opsGrid}>
            {/* Search */}
            <div style={p.opCard}>
              <div style={p.opTitle}>🔍 Search Assets</div>
              <SearchPanel />
            </div>

            {/* Upload */}
            <div style={p.opCard}>
              <div style={p.opTitle}>⬆️ Upload</div>
              <UploadZone />
            </div>
          </div>
        </div>

        {/* ── Categories ── */}
        <CategoryPanel />

        {/* ── Quick Links ── */}
        <div style={p.linksRow}>
          <a href="/wiki/roadmap" style={p.quietLink}>⚡ View Roadmap →</a>
          <a href="/studio"       style={p.quietLink}>✦ AI Studio →</a>
          <a href="/wiki"         style={p.quietLink}>◈ Docs & Wiki →</a>
        </div>

      </div>
    </div>
  )
}

const p: Record<string, any> = {
  root:        { minHeight: '100vh', background: 'var(--db-bg)', color: 'var(--db-text)', fontFamily: 'var(--db-font)', fontSize: 13 },
  topnav:      { borderBottom: '1px solid var(--db-border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, background: 'var(--db-surface)' },
  topnavLabel: { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', marginRight: 4 },
  navBtn:      { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', textDecoration: 'none', border: '1px solid var(--db-border)', borderRadius: 6, padding: '4px 10px', transition: 'border-color 0.15s, color 0.15s', background: 'var(--db-surface2)' },
  main:        { maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column' as const, gap: 16 },
  panel:       { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 'var(--db-radius-lg)', padding: '18px 20px' },
  panelLabel:  { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--db-text-dim)', marginBottom: 14 },
  opsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  opCard:      { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  opTitle:     { fontSize: 12, fontWeight: 600, color: 'var(--db-text)', fontFamily: 'var(--db-font-mono)' },
  catGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginTop: 4 },
  catCard:     { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column' as const, gap: 2 },
  catEmoji:    { fontSize: 16 },
  catLabel:    { fontSize: 12, fontWeight: 500, color: 'var(--db-text)' },
  catSoon:     { fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },
  linksRow:    { display: 'flex', gap: 20, padding: '4px 0' },
  quietLink:   { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-accent)', textDecoration: 'none' },
}
