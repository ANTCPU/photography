'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Stats = {
  discordConnected: boolean
  totalEvents: number
  topCategory: string | null
}

export default function TopBar() {
  const router = useRouter()
  const [stats, setStats]   = useState<Stats | null>(null)
  const [user, setUser]     = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    // Get stats
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d.status))
      .catch(() => setStats(null))

    // Get current user from session check
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
    router.push('/login')
  }

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

      {/* Right — user + logout */}
      <div style={s.right}>
        {user && (
          <span style={s.userChip}>
            <span style={s.userDot} />
            {user}
          </span>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={s.logoutBtn}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,94,94,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--db-border)')}
        >
          {loggingOut ? '···' : 'Sign out'}
        </button>
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
  right:    { display: 'flex', alignItems: 'center', gap: 10 },
  userChip: {
    fontSize: 11, fontFamily: 'var(--db-font-mono)',
    color: 'var(--db-text-muted)',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  userDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--db-teal)',
    boxShadow: '0 0 4px var(--db-teal)',
    flexShrink: 0,
  },
  logoutBtn: {
    fontSize: 11, fontFamily: 'var(--db-font-mono)',
    color: 'var(--db-red)', background: 'none',
    border: '1px solid var(--db-border)',
    borderRadius: 6, padding: '4px 10px',
    cursor: 'pointer', transition: 'border-color 0.15s',
  },
}
