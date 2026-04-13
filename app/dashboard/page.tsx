'use client'

import { useDashboard } from './context/DashboardContext'
import UploadZone from './components/UploadZone'
import SearchPanel from './components/SearchPanel'
import { CATEGORIES } from '@/lib/categories'
import { useEffect, useState } from 'react'

// ── Micro components ──────────────────────────────────────────────────────────

const Skel = ({ w = '100%', h = 14 }: { w?: string | number; h?: number }) => (
  <div className="db-skeleton" style={{ width: w, height: h, borderRadius: 4 }} />
)

const Pill = ({ status }: { status: string }) => (
  <span className={`db-pill db-pill--${status}`}>
    <span className="db-pill__dot" />{status}
  </span>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={s.label}>{children}</div>
)

const Panel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...s.panel, ...style }}>{children}</div>
)

const Empty = ({ icon, text, action }: { icon?: string; text: string; action?: React.ReactNode }) => (
  <div style={s.empty}>
    {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
    <span style={s.emptyText}>{text}</span>
    {action}
  </div>
)

// ── Data hook ─────────────────────────────────────────────────────────────────

function useData(urls: string[]) {
  const [data, setData]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all(urls.map(u => fetch(u).then(r => r.json())))
      .then(setData).catch(() => setData([])).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────

function Overview() {
  const { data, loading } = useData(['/api/assets', '/api/stats'])
  const count   = data[0]?.count ?? 0
  const discord = data[1]?.status?.discordConnected

  const stats = [
    { label: 'Assets',  value: loading ? '···' : String(count),                    color: 'var(--db-accent)' },
    { label: 'Discord', value: loading ? '···' : discord ? 'Live' : 'Offline',     color: discord ? 'var(--db-teal)' : 'var(--db-red)' },
    { label: 'Storage', value: 'Blob',                                              color: 'var(--db-blue)' },
    { label: 'Version', value: 'v0.1',                                              color: 'var(--db-text-muted)' },
  ]

  return (
    <div style={s.main}>
      {/* Stats strip */}
      <div style={s.statsGrid}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={s.statCard}>
            <span style={s.statLabel}>{label}</span>
            {loading && label !== 'Storage' && label !== 'Version'
              ? <Skel w={50} h={24} />
              : <span style={{ ...s.statValue, color }}>{value}</span>
            }
          </div>
        ))}
      </div>

      {/* Upload + Search */}
      <Panel>
        <Label>Image Operations</Label>
        <div style={s.opsGrid}>
          <div style={s.opCard}><span style={s.opTitle}>🔍 Search</span><SearchPanel /></div>
          <div style={s.opCard}><span style={s.opTitle}>⬆️ Upload</span><UploadZone /></div>
        </div>
      </Panel>

      {/* Categories */}
      <Panel>
        <Label>📂 Categories</Label>
        <div style={s.catGrid}>
          {CATEGORIES.map(c => (
            <div key={c.id} style={s.catCard}>
              <span style={{ fontSize: 15 }}>{c.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--db-text)' }}>{c.label}</span>
              <span style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>soon</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Quick links */}
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
              <div key={i} style={s.assetCard}>
                <Skel w="100%" h={160} />
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skel w="75%" h={10} /><Skel w="50%" h={8} />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <Empty icon="📂" text="No assets yet — upload your first image" />
        ) : (
          <div style={s.assetGrid}>
            {assets.map((a: any) => (
              <div key={a.id} style={s.assetCard}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--db-border)')}
              >
                <div style={{ width: '100%', aspectRatio: '1', background: 'var(--db-surface3)', overflow: 'hidden' }}>
                  <img src={a.thumbnailUrl} alt={a.filename} style={s.assetImg}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={s.assetName} title={a.filename}>{a.filename}</span>
                  <span style={s.assetMeta}>{a.category} · {a.meta}</span>
                  <Pill status={a.status} />
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
    { label: 'Assets',   value: String(assets.length),                                  color: 'var(--db-accent)' },
    { label: 'Storage',  value: `${totalMb.toFixed(1)} MB`,                             color: 'var(--db-blue)' },
    { label: 'Discord',  value: stats?.discordConnected ? 'Live' : 'Offline',           color: stats?.discordConnected ? 'var(--db-teal)' : 'var(--db-red)' },
    { label: 'Events',   value: String(stats?.totalEvents ?? 0),                        color: 'var(--db-amber)' },
  ]

  return (
    <div style={s.main}>
      <div style={s.statsGrid}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={s.statCard}>
            <span style={s.statLabel}>{label}</span>
            {loading ? <Skel w={50} h={24} /> : <span style={{ ...s.statValue, color }}>{value}</span>}
          </div>
        ))}
      </div>

      <Panel>
        <Label>By Category</Label>
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} style={{ marginBottom: 8 }}><Skel h={10} /></div>)
          : Object.keys(byCategory).length === 0
            ? <Empty text="No assets yet" />
            : Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', width: 110, flexShrink: 0 }}>{cat}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--db-surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / assets.length) * 100}%`, background: 'var(--db-accent)', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', width: 16, textAlign: 'right' }}>{count}</span>
                </div>
              ))
        }
      </Panel>

      <Panel>
        <Label>All Assets</Label>
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} style={{ marginBottom: 8 }}><Skel h={36} /></div>)
          : assets.length === 0
            ? <Empty text="No assets yet" />
            : assets.map((a: any, i: number) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < assets.length - 1 ? '1px solid var(--db-border)' : 'none' }}>
                  <img src={a.thumbnailUrl} alt={a.filename} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', flexShrink: 0, background: 'var(--db-surface2)' }}
                    onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', marginTop: 2 }}>{a.category} · {a.meta}</div>
                  </div>
                  <Pill status={a.status} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', flexShrink: 0 }}>
                    {new Date(a.uploadedAt).toLocaleDateString()}
                  </span>
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
        <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
        <Empty icon="🔧" text={`${info.desc} — ${info.eta}`}
          action={<a href="/wiki/roadmap" style={s.emptyAction}>View Roadmap →</a>} />
      </Panel>
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

const BUILT = ['overview', 'portfolio', 'uploads', 'analytics']

export default function DashboardPage() {
  const { activeSection } = useDashboard()

  return (
    <>
      {/* Top nav */}
      <div style={s.topnav}>
        <span style={s.topnavLabel}>JUMP TO →</span>
        {[
          ['📁 Assets',   '/dashboard/assets'],
          ['⚙️ API',      '/api/assets'],
          ['◎ Status',    '/wiki/status'],
          ['↗ Live Site', 'https://antcpu.com/manda'],
          ['⚡ Roadmap',  '/wiki/roadmap'],
          ['✦ Studio',    '/studio'],
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
      {!BUILT.includes(activeSection) && <ComingSoon name={activeSection} />}
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  // Layout
  main:        { maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 },
  panel:       { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 'var(--db-radius-lg)', padding: '18px 20px' },
  label:       { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--db-text-dim)', marginBottom: 14 },
  topnav:      { borderBottom: '1px solid var(--db-border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--db-surface)' },
  topnavLabel: { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', marginRight: 4 },
  navBtn:      { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', textDecoration: 'none', border: '1px solid var(--db-border)', borderRadius: 6, padding: '4px 10px', transition: 'border-color 0.15s, color 0.15s', background: 'var(--db-surface2)' },

  // Stats
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  statCard:    { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  statLabel:   { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', color: 'var(--db-text-dim)', textTransform: 'uppercase' },
  statValue:   { fontSize: 22, fontWeight: 700, fontFamily: 'var(--db-font-mono)', letterSpacing: '-0.02em' },

  // Ops
  opsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  opCard:      { display: 'flex', flexDirection: 'column', gap: 10 },
  opTitle:     { fontSize: 12, fontWeight: 600, color: 'var(--db-text)', fontFamily: 'var(--db-font-mono)' },

  // Categories
  catGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 },
  catCard:     { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 },

  // Links
  links:       { display: 'flex', gap: 20, flexWrap: 'wrap' },
  quietLink:   { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-accent)', textDecoration: 'none' },

  // Portfolio
  assetGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 },
  assetCard:   { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' },
  assetImg:    { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  assetName:   { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  assetMeta:   { fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },

  // Empty
  empty:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '36px 0' },
  emptyText:   { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)' },
  emptyAction: { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-accent)', textDecoration: 'none', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 6, padding: '6px 14px', background: 'rgba(200,245,100,0.06)' },
}
