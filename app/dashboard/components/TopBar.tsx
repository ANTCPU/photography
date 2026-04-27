'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from '../context/DashboardContext'

type Stats = {
  discordConnected: boolean
  totalEvents: number
  topCategory: string | null
}

export default function TopBar() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard()

  useEffect(() => {
    // Get stats
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d.status))
      .catch(() => setStats(null))

  }, [])


  const badges = stats ? [
    {
      label: stats.discordConnected ? 'Discord: Live' : 'Discord: Offline',
      color: stats.discordConnected ? 'var(--db-teal)' : 'var(--db-red)',
      bg:    stats.discordConnected ? 'var(--db-teal-dim)' : 'var(--db-red-dim)',
    },
    {
      label: `${stats.totalEvents} Events`,
      color: 'var(--db-blue)',
      bg:    'var(--db-blue-dim)',
    },
    {
      label: stats.topCategory ? `Top: ${stats.topCategory}` : 'No Activity',
      color: 'var(--db-amber)',
      bg:    'var(--db-amber-dim)',
    },
  ] : [{ label: '···', color: 'var(--db-text-dim)', bg: 'var(--db-surface2)' }]

  return (
    <header style={s.bar}>
      {/* Left — wordmark */}
      <div style={s.left}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={s.hamburger}
          aria-label="Toggle menu"
        >
          <span style={{ display:'block', width:18, height:2, background:'var(--db-text)', marginBottom:4, transition:'all 0.2s' }} />
          <span style={{ display:'block', width:18, height:2, background:'var(--db-text)', marginBottom:4, transition:'all 0.2s' }} />
          <span style={{ display:'block', width:18, height:2, background:'var(--db-text)', transition:'all 0.2s' }} />
        </button>
        <span style={s.wordmark}>
          AMANDA<span style={{ color: 'var(--db-accent)' }}>/</span>STUDIO
        </span>
      </div>

      {/* Center — live badges */}
      <div style={s.badges}>
        {badges.map((b) => (
          <span key={b.label} style={{ ...s.badge, color: b.color, background: b.bg }}>
            {b.label}
          </span>
        ))}
      </div>


    </header>
  )
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    height: 52, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    padding: '0 20px',
    borderBottom: '1px solid var(--db-border)',
    background: 'var(--db-surface)',
    position: 'sticky', top: 0, zIndex: 50,
    flexWrap: 'wrap',
  },
  left:     { display: 'flex', alignItems: 'center', gap: 12 },
  wordmark: { fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)' },
  badges:   { display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center' },
  badge:    { fontSize: 10, fontFamily: 'var(--db-font-mono)', padding: '3px 8px', borderRadius: 20, fontWeight: 500 },
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', flexShrink: 0,
  },
}
