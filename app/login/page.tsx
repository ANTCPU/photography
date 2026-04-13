// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PLACEHOLDERS } from '@/lib/constants'

const USERS = [
  {
    id: 'amanda',
    label: 'Amanda',
    handle: '@amanda',
    avatar: PLACEHOLDERS.profile,
    type: 'image' as const,
  },
  {
    id: 'antcpu',
    label: 'antcpu',
    handle: '@antcpu',
    avatar: null,
    type: 'initials' as const,
    initials: 'AC',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'loading' | 'error'>('checking')

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then((r) => {
        if (r.ok) {
          router.replace('/dashboard')
        } else {
          setStatus('idle')
        }
      })
      .catch(() => setStatus('idle'))
  }, [router])

  async function handleLogin() {
    if (!selectedUser || !password) return
    setStatus('loading')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, user: selectedUser }),
        credentials: 'include',
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setStatus('error')
        setPassword('')
      }
    } catch {
      setStatus('error')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  const canSubmit = !!selectedUser && !!password && status !== 'loading'

  if (status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0d11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' }}>···</span>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <div style={s.card}>

        <div style={s.header}>
          <span style={s.badge}>AMANDA PHOTOGRAPHY</span>
          <h1 style={s.title}>Studio Access</h1>
          <p style={s.sub}>Select your profile, then enter the studio key.</p>
        </div>

        <div style={s.userRow}>
          {USERS.map((u) => {
            const selected = selectedUser === u.id
            return (
              <button
                key={u.id}
                onClick={() => { setSelectedUser(u.id); setStatus('idle') }}
                style={{
                  ...s.userBtn,
                  borderColor: selected ? '#c8f564' : 'rgba(255,255,255,0.06)',
                  background: selected ? 'rgba(200,245,100,0.06)' : '#12151c',
                }}
              >
                {u.type === 'image' ? (
                  <img
                    src={u.avatar!}
                    alt={u.label}
                    style={{
                      ...s.avatar,
                      border: selected ? '2px solid #c8f564' : '2px solid rgba(255,255,255,0.1)',
                    }}
                  />
                ) : (
                  <div style={{
                    ...s.avatarInitials,
                    border: selected ? '2px solid #c8f564' : '2px solid rgba(255,255,255,0.1)',
                    background: selected ? 'rgba(200,245,100,0.15)' : 'rgba(255,255,255,0.05)',
                    color: selected ? '#c8f564' : '#7c8096',
                  }}>
                    {u.initials}
                  </div>
                )}
                <span style={{
                  ...s.userName,
                  color: selected ? '#e8eaf0' : '#7c8096',
                  fontWeight: selected ? 600 : 400,
                }}>
                  {u.label}
                </span>
                <span style={s.userHandle}>{u.handle}</span>
                {selected && <span style={s.selectedDot} />}
              </button>
            )
          })}
        </div>

        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Studio Key</label>
          <input
            type="password"
            placeholder={selectedUser ? `Key for ${selectedUser}` : 'Select a profile first'}
            value={password}
            disabled={!selectedUser}
            onChange={(e) => { setPassword(e.target.value); setStatus('idle') }}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            style={{
              ...s.input,
              borderColor: status === 'error' ? '#ff5e5e' : 'rgba(255,255,255,0.1)',
              opacity: selectedUser ? 1 : 0.4,
              cursor: selectedUser ? 'text' : 'not-allowed',
            }}
          />
          {status === 'error' && (
            <span style={s.errorMsg}>✕ Wrong key — try again</span>
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={!canSubmit}
          style={{
            ...s.submitBtn,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: status === 'loading' ? 'rgba(200,245,100,0.6)' : '#c8f564',
          }}
        >
          {status === 'loading'
            ? '···'
            : selectedUser
              ? `Enter as ${selectedUser} →`
              : 'Enter Studio →'}
        </button>

        <div style={s.backRow}>
          <a href="/" style={s.backLink}>← Back to platform</a>
        </div>

      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#0b0d11',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    padding: '16px',
  },
  card: {
    background: '#12151c',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 'clamp(24px, 5vw, 36px) clamp(20px, 5vw, 32px)',
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxSizing: 'border-box',
  },
  header: { display: 'flex', flexDirection: 'column', gap: 8 },
  badge: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: '0.15em',
    color: '#c8f564',
    background: 'rgba(200,245,100,0.08)',
    border: '1px solid rgba(200,245,100,0.2)',
    borderRadius: 20,
    padding: '3px 10px',
    alignSelf: 'flex-start',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#e8eaf0', margin: 0 },
  sub: { fontSize: 12, color: '#7c8096', margin: 0, lineHeight: 1.6 },
  userRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  userBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '16px 12px',
    border: '1px solid',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    position: 'relative',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    objectFit: 'cover',
    transition: 'border-color 0.15s',
  },
  avatarInitials: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'all 0.15s',
  },
  userName: { fontSize: 13, color: '#e8eaf0' },
  userHandle: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
  selectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#c8f564',
    boxShadow: '0 0 6px #c8f564',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: '0.12em',
    color: '#7c8096',
    textTransform: 'uppercase',
  },
  input: {
    background: '#0b0d11',
    border: '1px solid',
    borderRadius: 8,
    padding: '11px 14px',
    color: '#e8eaf0',
    fontSize: 16,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  errorMsg: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#ff5e5e',
  },
  submitBtn: {
    background: '#c8f564',
    color: '#0b0d11',
    fontWeight: 700,
    fontSize: 14,
    padding: '13px',
    borderRadius: 8,
    border: 'none',
    width: '100%',
    transition: 'opacity 0.15s, background 0.15s',
    fontFamily: "'DM Sans', sans-serif",
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  },
  backRow: { display: 'flex', justifyContent: 'center' },
  backLink: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#4a4f63',
    textDecoration: 'none',
    padding: '8px',
  },
}
