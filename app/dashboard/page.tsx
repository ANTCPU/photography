'use client'

import { useDashboard } from './context/DashboardContext'
import UploadZone from './components/UploadZone'
import SearchPanel from './components/SearchPanel'
import { CATEGORIES } from '@/lib/categories'
import { useEffect, useState, useCallback } from 'react'

// ── Micro components ──────────────────────────────────────────────────────────

const Skel = ({ w = '100%', h = 14 }: { w?: string | number; h?: number }) => (
  <div style={{ width: w, height: h, background: 'var(--db-surface3)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
)

const Pill = ({ status }: { status: string }) => (
  <span style={{ fontSize: 9, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface3)', border: '1px solid var(--db-border)', borderRadius: 4, padding: '2px 6px', color: 'var(--db-text-dim)', textTransform: 'uppercase' }}>{status}</span>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--db-text-dim)', marginBottom: 14 }}>{children}</div>
)

const Panel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 'var(--db-radius-lg)', padding: '18px 20px', ...style }}>{children}</div>
)

const Empty = ({ icon, text, action }: { icon?: string; text: string; action?: React.ReactNode }) => (
  <div style={s.empty}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
      <span style={s.emptyText}>{text}</span>
      {action}
    </div>
  </div>
)

// ── Data hook — public fetch ───────────────────────────────────────────────────
function useData(urls: string[]) {
  const [data, setData]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all(urls.map(u => fetch(u).then(r => r.json())))
      .then(setData).catch(() => setData([])).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}

// ── Vault data hook — authenticated fetch (includes private assets) ────────────
function useVaultData() {
  const [assets,  setAssets]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/assets?visibility=all', {
        credentials: 'include', // sends upload_token cookie
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

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview() {
  const { data, loading } = useData(['/api/assets', '/api/stats'])
  const count   = data[0]?.count ?? 0
  const discord = data[1]?.status?.discordConnected

  const stats = [
    { label: 'Assets',  value: loading ? '···' : String(count),              color: 'var(--db-accent)' },
    { label: 'Discord', value: loading ? '···' : discord ? 'Live' : 'Offline', color: discord ? 'var(--db-teal)' : 'var(--db-red)' },
    { label: 'Storage', value: 'Blob',                                        color: 'var(--db-blue)' },
    { label: 'Version', value: 'v0.1',                                        color: 'var(--db-text-muted)' },
  ]

  return (
    <div style={s.main}>
      <Panel>
        <div style={s.statsGrid}>
          {stats.map(({ label, value, color }) => (
            <div key={label} style={s.statCard}>
              <span style={s.statLabel}>{label}</span>
              {loading && label !== 'Storage' && label !== 'Version'
                ? <Skel h={28} />
                : <span style={{ ...s.statValue, color }}>{value}</span>
              }
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Label>Image Operations</Label>
        <div style={s.opsGrid}>
          <div style={s.opCard}><span style={s.opTitle}>🔍 Search</span><SearchPanel /></div>
          <div style={s.opCard}><span style={s.opTitle}>⬆️ Upload</span><UploadZone /></div>
        </div>
      </Panel>

      <Panel>
        <Label>📂 Categories</Label>
        <div style={s.catGrid}>
          {CATEGORIES.map(c => (
            <div key={c.id} style={s.catCard}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <span style={{ fontSize: 11, color: 'var(--db-text)' }}>{c.label}</span>
              <span style={{ fontSize: 9, color: 'var(--db-text-dim)' }}>soon</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div style={s.links}>
          {[['⚡ Roadmap', '/wiki/roadmap'], ['✦ Studio', '/studio'], ['◈ Wiki', '/wiki'], ['◎ Status', '/wiki/status']].map(([label, href]) => (
            <a key={href} href={href} style={s.quietLink}>{label} →</a>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
function Portfolio() {
  const { data, loading } = useData(['/api/assets'])
  const assets = data[0]?.assets ?? []

  return (
    <div style={s.main}>
      <Panel>
        <Label>Portfolio — {loading ? '···' : `${assets.length} asset${assets.length !== 1 ? 's' : ''}`}</Label>
        {loading ? (
          <div style={s.assetGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={s.assetCard}><Skel h={120} /></div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <Empty icon="📂" text="No public assets yet" />
        ) : (
          <div style={s.assetGrid}>
            {assets.map((a: any) => (
              <div key={a.id} style={s.assetCard}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--db-border)')}>
                <div style={{ height: 120, overflow: 'hidden', background: 'var(--db-surface3)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.thumbnailUrl} alt={a.filename} style={s.assetImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={s.assetName}>{a.filename}</div>
                  <div style={s.assetMeta}>{a.category} · {a.meta}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

// ── UPLOADS ───────────────────────────────────────────────────────────────────
function Uploads() {
  return (
    <div style={s.main}>
      <Panel><Label>⬆️ Upload Images</Label><UploadZone /></Panel>
      <Panel><Label>Search After Upload</Label><SearchPanel /></Panel>
    </div>
  )
}

// ── VAULT ─────────────────────────────────────────────────────────────────────
// Private staging area — all assets visible, release/assign controls
// Auth: upload_token cookie required
function Vault() {
  const { assets, loading, error, reload } = useVaultData()
  const [acting, setActing] = useState<string | null>(null) // asset id being actioned
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
      if (res.ok) {
        showToast(`✓ ${json.updated?.visibility ?? 'updated'}`)
        await reload()
      } else {
        showToast(`✕ ${json.error}`)
      }
    } catch {
      showToast('✕ Network error')
    } finally {
      setActing(null)
    }
  }

  async function remove(id: string, filename: string) {
    if (!confirm(`Remove "${filename}" from vault? (Blob + Cloudinary not deleted)`)) return
    setActing(id)
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method:      'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (res.ok) {
        showToast(`✓ Removed ${json.removed?.filename}`)
        await reload()
      } else {
        showToast(`✕ ${json.error}`)
      }
    } catch {
      showToast('✕ Network error')
    } finally {
      setActing(null)
    }
  }

  // Group by visibility
  const privateAssets = assets.filter(a => (a.visibility || 'public') === 'private')
  const partnerAssets = assets.filter(a => (a.visibility || 'public') === 'partner')
  const publicAssets  = assets.filter(a => (a.visibility || 'public') === 'public')

  const PARTNERS = ['mapofpi', 'wedding']

  return (
    <div style={s.main}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontFamily: 'var(--db-font-mono)', color: '#c8f564', zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Label>🔒 Private Vault</Label>
            <div style={{ fontSize: 11, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', marginTop: -10 }}>
              Stage images privately · assign to partners · release when ready
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Counts */}
            {[
              { label: 'private', count: privateAssets.length, color: 'var(--db-red)' },
              { label: 'partner', count: partnerAssets.length, color: 'var(--db-amber)' },
              { label: 'public',  count: publicAssets.length,  color: 'var(--db-teal)' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', color, background: 'var(--db-surface2)', border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 8px' }}>
                {count} {label}
              </div>
            ))}
            <button onClick={reload} style={s.actionBtn}>↻ Refresh</button>
          </div>
        </div>
      </Panel>

      {/* Error state */}
      {error && (
        <Panel style={{ borderColor: 'rgba(255,94,94,0.3)' }}>
          <div style={{ fontSize: 12, color: 'var(--db-red)', fontFamily: 'var(--db-font-mono)' }}>
            🔐 {error}
          </div>
        </Panel>
      )}

      {/* Loading */}
      {loading && (
        <Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <Skel key={i} h={48} />)}
          </div>
        </Panel>
      )}

      {/* Private assets */}
      {!loading && !error && (
        <Panel>
          <Label>🔒 Private — staging ({privateAssets.length})</Label>
          {privateAssets.length === 0 ? (
            <Empty text="No private assets — upload with visibility: private" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {privateAssets.map(a => (
                <VaultRow
                  key={a.id}
                  asset={a}
                  acting={acting === a.id}
                  partners={PARTNERS}
                  onRelease={() => patch(a.id, { visibility: 'public' })}
                  onAssign={partner => patch(a.id, { visibility: 'partner', partner })}
                  onRemove={() => remove(a.id, a.filename)}
                />
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Partner assets */}
      {!loading && !error && partnerAssets.length > 0 && (
        <Panel>
          <Label>🤝 Partner — assigned ({partnerAssets.length})</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {partnerAssets.map(a => (
              <VaultRow
                key={a.id}
                asset={a}
                acting={acting === a.id}
                partners={PARTNERS}
                onRelease={() => patch(a.id, { visibility: 'public' })}
                onAssign={partner => patch(a.id, { visibility: 'partner', partner })}
                onRemove={() => remove(a.id, a.filename)}
                onRevoke={() => patch(a.id, { visibility: 'private', partner: null })}
              />
            ))}
          </div>
        </Panel>
      )}

      {/* Public assets — read only summary */}
      {!loading && !error && publicAssets.length > 0 && (
        <Panel>
          <Label>🌐 Public — live ({publicAssets.length})</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {publicAssets.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--db-surface2)', borderRadius: 8, border: '1px solid var(--db-border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.thumbnailUrl} alt={a.filename} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</div>
                  <div style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>{a.category} · {a.meta}</div>
                </div>
                <div style={{ fontSize: 9, color: 'var(--db-teal)', fontFamily: 'var(--db-font-mono)', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>
                  🌐 live
                </div>
                <button
                  onClick={() => patch(a.id, { visibility: 'private' })}
                  disabled={acting === a.id}
                  style={{ ...s.actionBtn, fontSize: 9, color: 'var(--db-text-dim)' }}
                >
                  {acting === a.id ? '···' : 'unpublish'}
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

    </div>
  )
}

// ── VAULT ROW ─────────────────────────────────────────────────────────────────
function VaultRow({
  asset, acting, partners,
  onRelease, onAssign, onRemove, onRevoke,
}: {
  asset:     any
  acting:    boolean
  partners:  string[]
  onRelease: () => void
  onAssign:  (partner: string) => void
  onRemove:  () => void
  onRevoke?: () => void
}) {
  const [showAssign, setShowAssign] = useState(false)
  const vis = asset.visibility || 'public'

  return (
    <div style={{ background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.thumbnailUrl} alt={asset.filename}
          style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'var(--db-surface3)' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />

        {/* Info */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {asset.filename}
          </div>
          <div style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', marginTop: 2 }}>
            {asset.category} · {asset.meta}
            {asset.partner && <span style={{ color: 'var(--db-amber)', marginLeft: 6 }}>→ {asset.partner}</span>}
            {asset.releasedAt && <span style={{ color: 'var(--db-teal)', marginLeft: 6 }}>released {new Date(asset.releasedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Visibility badge */}
        <div style={{
          fontSize: 9, fontFamily: 'var(--db-font-mono)', borderRadius: 4, padding: '2px 6px', flexShrink: 0,
          ...(vis === 'private' ? { color: 'var(--db-red)',   background: 'rgba(255,94,94,0.08)',   border: '1px solid rgba(255,94,94,0.2)'   } :
              vis === 'partner' ? { color: 'var(--db-amber)', background: 'rgba(255,180,0,0.08)',   border: '1px solid rgba(255,180,0,0.2)'   } :
                                  { color: 'var(--db-teal)',  background: 'rgba(0,200,150,0.08)',   border: '1px solid rgba(0,200,150,0.2)'   }),
        }}>
          {vis === 'private' ? '🔒 private' : vis === 'partner' ? `🤝 ${asset.partner}` : '🌐 public'}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid var(--db-border)', flexWrap: 'wrap' }}>
        {/* Release to public */}
        {vis !== 'public' && (
          <button onClick={onRelease} disabled={acting} style={{ ...s.actionBtn, color: 'var(--db-teal)', borderColor: 'rgba(0,200,150,0.3)' }}>
            {acting ? '···' : '🌐 Release public'}
          </button>
        )}

        {/* Assign to partner */}
        {vis !== 'public' && (
          <button onClick={() => setShowAssign(v => !v)} disabled={acting} style={s.actionBtn}>
            🤝 Assign partner
          </button>
        )}

        {/* Revoke from partner back to private */}
        {vis === 'partner' && onRevoke && (
          <button onClick={onRevoke} disabled={acting} style={{ ...s.actionBtn, color: 'var(--db-red)', borderColor: 'rgba(255,94,94,0.3)' }}>
            {acting ? '···' : '🔒 Revoke'}
          </button>
        )}

        {/* Remove from KV */}
        <button onClick={onRemove} disabled={acting} style={{ ...s.actionBtn, color: 'var(--db-red)', borderColor: 'rgba(255,94,94,0.2)', marginLeft: 'auto' }}>
          {acting ? '···' : '✕ Remove'}
        </button>
      </div>

      {/* Partner picker — inline dropdown */}
      {showAssign && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid var(--db-border)', flexWrap: 'wrap', background: 'var(--db-surface)' }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', alignSelf: 'center' }}>Assign to:</span>
          {partners.map(p => (
            <button key={p} onClick={() => { onAssign(p); setShowAssign(false) }} disabled={acting}
              style={{ ...s.actionBtn, color: 'var(--db-amber)', borderColor: 'rgba(255,180,0,0.3)' }}>
              {p}
            </button>
          ))}
          <button onClick={() => setShowAssign(false)} style={{ ...s.actionBtn, marginLeft: 'auto' }}>cancel</button>
        </div>
      )}
    </div>
  )
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
function Analytics() {
  const { data, loading } = useData(['/api/stats', '/api/assets'])
  const stats  = data[0]?.status
  const assets: any[] = data[1]?.assets ?? []

  const byCategory = assets.reduce((acc: Record<string, number>, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1; return acc
  }, {})

  const totalMb = assets.reduce((sum, a) => sum + (parseFloat(a.meta) || 0), 0)

  const statCards = [
    { label: 'Assets',  value: String(assets.length),                                    color: 'var(--db-accent)' },
    { label: 'Storage', value: `${totalMb.toFixed(1)} MB`,                               color: 'var(--db-blue)'   },
    { label: 'Discord', value: stats?.discordConnected ? 'Live' : 'Offline',             color: stats?.discordConnected ? 'var(--db-teal)' : 'var(--db-red)' },
    { label: 'Events',  value: String(stats?.totalEvents ?? 0),                          color: 'var(--db-amber)'  },
  ]

  return (
    <div style={s.main}>
      <Panel>
        <div style={s.statsGrid}>
          {statCards.map(({ label, value, color }) => (
            <div key={label} style={s.statCard}>
              <span style={s.statLabel}>{label}</span>
              {loading ? <Skel h={28} /> : <span style={{ ...s.statValue, color }}>{value}</span>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Label>By Category</Label>
        {loading
          ? [...Array(3)].map((_, i) => <Skel key={i} h={24} />)
          : Object.keys(byCategory).length === 0
          ? <Empty text="No assets yet" />
          : Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--db-border)', fontSize: 11, fontFamily: 'var(--db-font-mono)' }}>
              <span style={{ color: 'var(--db-text)' }}>{cat}</span>
              <span style={{ color: 'var(--db-accent)' }}>{count}</span>
            </div>
          ))
        }
      </Panel>

      <Panel>
        <Label>All Assets</Label>
        {loading
          ? [...Array(3)].map((_, i) => <Skel key={i} h={40} />)
          : assets.length === 0
          ? <Empty text="No assets yet" />
          : assets.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--db-border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.thumbnailUrl} alt={a.filename} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</div>
                <div style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>{a.category} · {a.meta}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', flexShrink: 0 }}>{new Date(a.uploadedAt).toLocaleDateString()}</span>
            </div>
          ))
        }
      </Panel>
    </div>
  )
}

// ── COMING SOON ───────────────────────────────────────────────────────────────
const ROADMAP: Record<string, { eta: string; desc: string }> = {
  wallet:    { eta: 'v0.3', desc: 'Antcoin balance, transactions & earnings' },
  sales:     { eta: 'v0.3', desc: 'Sales history and revenue tracking' },
  licensing: { eta: 'v0.3', desc: 'License management and commercial usage' },
  settings:  { eta: 'v0.2', desc: 'Platform settings, API keys & preferences' },
    deploy:    { eta: 'v0.4', desc: 'Deployment history and build logs' },
}

function ComingSoon({ name }: { name: string }) {
  const info = ROADMAP[name] ?? { eta: 'v0.2', desc: 'Coming soon' }
  return (
    <div style={s.main}>
      <Panel>
        <Empty
          icon="🚧"
          text={`${name.charAt(0).toUpperCase() + name.slice(1)} — ${info.desc}`}
          action={<a href="/wiki/roadmap" style={s.emptyAction}>View Roadmap →</a>}
        />
      </Panel>
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

const BUILT = ['overview', 'portfolio', 'uploads', 'analytics', 'vault']

export default function DashboardPage() {
  const { activeSection } = useDashboard()

  return (
    <>
      {/* Top nav */}
      <div style={s.topnav}>
        <span style={s.topnavLabel}>JUMP TO →</span>
        {[
          ['📁 Assets',   '/dashboard/assets'],
          ['🔒 Vault',    '/dashboard/vault'],
          ['⚙️ API',      '/api/assets'],
          ['◎ Status',   '/wiki/status'],
          ['↗ Live Site', 'https://antcpu.com/manda'],
          ['⚡ Roadmap',  '/wiki/roadmap'],
          ['✦ Studio',   '/studio'],
        ].map(([label, href]) => (
          <a key={href} href={href} style={s.navBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,245,100,0.3)'; e.currentTarget.style.color = '#c8f564' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--db-border)'; e.currentTarget.style.color = 'var(--db-text)' }}
          >{label}</a>
        ))}
      </div>

      {/* Section router */}
      {activeSection === 'overview'  && <Overview />}
      {activeSection === 'portfolio' && <Portfolio />}
      {activeSection === 'uploads'   && <Uploads />}
      {activeSection === 'analytics' && <Analytics />}
      {activeSection === 'vault'     && <Vault />}
      {!BUILT.includes(activeSection) && <ComingSoon name={activeSection} />}
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  // Layout
  main:         { maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  panel:        { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 'var(--db-radius-lg)', padding: '18px 20px' },
  label:        { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--db-text-dim)', marginBottom: 14 },
  topnav:       { borderBottom: '1px solid var(--db-border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--db-surface)' },
  topnavLabel:  { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', marginRight: 4 },
  navBtn:       { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', textDecoration: 'none', border: '1px solid var(--db-border)', borderRadius: 6, padding: '4px 10px', transition: 'border-color 0.15s, color 0.15s', background: 'var(--db-surface2)' },

  // Stats
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  statCard:     { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  statLabel:    { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', color: 'var(--db-text-dim)', textTransform: 'uppercase' },
  statValue:    { fontSize: 22, fontWeight: 700, fontFamily: 'var(--db-font-mono)', letterSpacing: '-0.02em' },

  // Ops
  opsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  opCard:       { display: 'flex', flexDirection: 'column', gap: 10 },
  opTitle:      { fontSize: 12, fontWeight: 600, color: 'var(--db-text)', fontFamily: 'var(--db-font-mono)' },

  // Categories
  catGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 },
  catCard:      { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 },

  // Links
  links:        { display: 'flex', gap: 20, flexWrap: 'wrap' },
  quietLink:    { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-accent)', textDecoration: 'none' },

  // Portfolio
  assetGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 },
  assetCard:    { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' },
  assetImg:     { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  assetName:    { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  assetMeta:    { fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },

  // Vault action buttons
  actionBtn:    { fontSize: 10, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'var(--db-text)', transition: 'all 0.15s' },

  // Empty
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '36px 0' },
  emptyText:    { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)' },
  emptyAction:  { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-accent)', textDecoration: 'none', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 6, padding: '6px 14px', background: 'rgba(200,245,100,0.06)' },
}
 
