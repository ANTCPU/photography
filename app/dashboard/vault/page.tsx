// app/dashboard/vault/page.tsx
// Direct route to the private vault — /dashboard/vault
// Auth-gated via middleware (upload_token cookie)
// Renders the vault section standalone — no sidebar dependency
'use client'

import { useState, useCallback, useEffect } from 'react'

const PARTNERS = ['mapofpi', 'wedding']

function useVaultData() {
  const [assets,  setAssets]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/assets?visibility=all', {
        credentials: 'include',
      })
      if (res.status === 401) {
        setError('Not authenticated — sign in to view private assets')
        setAssets([])
        return
      }
      const json = await res.json()
      setAssets(json.assets ?? [])
    } catch {
      setError('Failed to load vault')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { assets, loading, error, reload: load }
}

export default function VaultPage() {
  const { assets, loading, error, reload } = useVaultData()
  const [acting, setActing] = useState<string | null>(null)
  const [toast,  setToast]  = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function patch(id: string, body: Record<string, any>) {
    setActing(id)
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) { showToast(`✓ ${json.updated?.visibility ?? 'updated'}`); await reload() }
      else          showToast(`✕ ${json.error}`)
    } catch { showToast('✕ Network error') }
    finally   { setActing(null) }
  }

  async function remove(id: string, filename: string) {
    if (!confirm(`Remove "${filename}" from vault?`)) return
    setActing(id)
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE', credentials: 'include' })
      const json = await res.json()
      if (res.ok) { showToast(`✓ Removed ${json.removed?.filename}`); await reload() }
      else          showToast(`✕ ${json.error}`)
    } catch { showToast('✕ Network error') }
    finally   { setActing(null) }
  }

  const privateAssets = assets.filter(a => (a.visibility || 'public') === 'private')
  const partnerAssets = assets.filter(a => (a.visibility || 'public') === 'partner')
  const publicAssets  = assets.filter(a => (a.visibility || 'public') === 'public')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'var(--db-font-mono, monospace)', padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', fontSize: 12, color: '#c8f564', zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>Amanda Photography</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>🔒 Private Vault</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Stage privately · assign to partners · release when ready</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: `${privateAssets.length} private`, color: '#ff5e5e' },
            { label: `${partnerAssets.length} partner`, color: '#f0883e' },
            { label: `${publicAssets.length} public`,   color: '#00c896' },
          ].map(({ label, color }) => (
            <span key={label} style={{ fontSize: 10, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 8px' }}>{label}</span>
          ))}
          <button onClick={reload} style={btn}>↻ Refresh</button>
          <a href="/dashboard" style={{ ...btn, textDecoration: 'none', color: '#555' }}>← Dashboard</a>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,94,94,0.08)', border: '1px solid rgba(255,94,94,0.3)', borderRadius: 10, padding: '14px 16px', fontSize: 12, color: '#ff5e5e', marginBottom: 16 }}>
          🔐 {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 64, background: '#111', borderRadius: 10, border: '1px solid #1a1a1a' }} />
          ))}
        </div>
      )}

      {/* Private */}
      {!loading && !error && (
        <Section label={`🔒 Private — staging (${privateAssets.length})`}>
          {privateAssets.length === 0
            ? <Empty text="No private assets — upload with visibility: private" />
            : privateAssets.map(a => (
              <VaultRow key={a.id} asset={a} acting={acting === a.id} partners={PARTNERS}
                onRelease={() => patch(a.id, { visibility: 'public' })}
                onAssign={p  => patch(a.id, { visibility: 'partner', partner: p })}
                onRemove={() => remove(a.id, a.filename)} />
            ))
          }
        </Section>
      )}

      {/* Partner */}
      {!loading && !error && partnerAssets.length > 0 && (
        <Section label={`🤝 Partner — assigned (${partnerAssets.length})`}>
          {partnerAssets.map(a => (
            <VaultRow key={a.id} asset={a} acting={acting === a.id} partners={PARTNERS}
              onRelease={() => patch(a.id, { visibility: 'public' })}
              onAssign={p  => patch(a.id, { visibility: 'partner', partner: p })}
              onRemove={() => remove(a.id, a.filename)}
              onRevoke={() => patch(a.id, { visibility: 'private', partner: null })} />
          ))}
        </Section>
      )}

      {/* Public */}
      {!loading && !error && publicAssets.length > 0 && (
        <Section label={`🌐 Public — live (${publicAssets.length})`}>
          {publicAssets.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#111', borderRadius: 8, border: '1px solid #1a1a1a', marginBottom: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.thumbnailUrl} alt={a.filename} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{a.category} · {a.meta}</div>
              </div>
              <span style={{ fontSize: 9, color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>🌐 live</span>
              <button onClick={() => patch(a.id, { visibility: 'private' })} disabled={acting === a.id} style={{ ...btn, fontSize: 9, color: '#555' }}>
                {acting === a.id ? '···' : 'unpublish'}
              </button>
            </div>
          ))}
        </Section>
      )}

    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 14 }}>{label}</div>
      {children}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 11, color: '#333' }}>{text}</div>
  )
}

// ── Vault row ─────────────────────────────────────────────────────────────────
function VaultRow({ asset, acting, partners, onRelease, onAssign, onRemove, onRevoke }: {
  asset:     any
  acting:    boolean
  partners:  string[]
  onRelease: () => void
  onAssign:  (p: string) => void
  onRemove:  () => void
  onRevoke?: () => void
}) {
  const [showAssign, setShowAssign] = useState(false)
  const vis = asset.visibility || 'public'

  const visBadge = {
    private: { color: '#ff5e5e', bg: 'rgba(255,94,94,0.08)',   border: 'rgba(255,94,94,0.2)',   label: '🔒 private' },
    partner: { color: '#f0883e', bg: 'rgba(240,136,62,0.08)',  border: 'rgba(240,136,62,0.2)',  label: `🤝 ${asset.partner}` },
    public:  { color: '#00c896', bg: 'rgba(0,200,150,0.08)',   border: 'rgba(0,200,150,0.2)',   label: '🌐 public' },
  }[vis] ?? { color: '#555', bg: 'transparent', border: '#333', label: vis }

  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.thumbnailUrl} alt={asset.filename}
          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#1a1a1a' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.filename}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>
            {asset.category} · {asset.meta}
            {asset.partner    && <span style={{ color: '#f0883e', marginLeft: 8 }}>→ {asset.partner}</span>}
            {asset.releasedAt && <span style={{ color: '#00c896', marginLeft: 8 }}>released {new Date(asset.releasedAt).toLocaleDateString()}</span>}
          </div>
          {/* Cloudinary ID — useful for wiring up Arena */}
          {asset.cloudinaryId && (
            <div style={{ fontSize: 9, color: '#333', marginTop: 3, fontFamily: 'monospace' }}>{asset.cloudinaryId}</div>
          )}
        </div>
        <span style={{ fontSize: 9, color: visBadge.color, background: visBadge.bg, border: `1px solid ${visBadge.border}`, borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>
          {visBadge.label}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
        {vis !== 'public' && (
          <button onClick={onRelease} disabled={acting} style={{ ...btn, color: '#00c896', borderColor: 'rgba(0,200,150,0.3)' }}>
            {acting ? '···' : '🌐 Release public'}
          </button>
        )}
        {vis !== 'public' && (
          <button onClick={() => setShowAssign(v => !v)} disabled={acting} style={btn}>
            🤝 Assign partner
          </button>
        )}
        {vis === 'partner' && onRevoke && (
          <button onClick={onRevoke} disabled={acting} style={{ ...btn, color: '#ff5e5e', borderColor: 'rgba(255,94,94,0.3)' }}>
            {acting ? '···' : '🔒 Revoke'}
          </button>
        )}
        <button onClick={onRemove} disabled={acting} style={{ ...btn, color: '#ff5e5e', borderColor: 'rgba(255,94,94,0.2)', marginLeft: 'auto' }}>
          {acting ? '···' : '✕ Remove'}
        </button>
      </div>

      {/* Partner picker */}
      {showAssign && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid #1a1a1a', flexWrap: 'wrap', background: '#111' }}>
          <span style={{ fontSize: 10, color: '#555', alignSelf: 'center' }}>Assign to:</span>
          {partners.map(p => (
            <button key={p} onClick={() => { onAssign(p); setShowAssign(false) }} disabled={acting}
              style={{ ...btn, color: '#f0883e', borderColor: 'rgba(240,136,62,0.3)' }}>
              {p}
            </button>
          ))}
          <button onClick={() => setShowAssign(false)} style={{ ...btn, marginLeft: 'auto' }}>cancel</button>
        </div>
      )}
    </div>
  )
}

// ── Shared button style ───────────────────────────────────────────────────────
const btn: React.CSSProperties = {
  fontSize: 10, fontFamily: 'monospace', background: '#111',
  border: '1px solid #222', borderRadius: 6, padding: '4px 10px',
  cursor: 'pointer', color: '#aaa', transition: 'all 0.15s',
}
