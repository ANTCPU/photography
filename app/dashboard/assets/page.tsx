// app/dashboard/assets/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link                              from 'next/link'
import { API }                           from '@/lib/constants'
import { CATEGORIES }                    from '@/lib/categories'

// ── Asset type ────────────────────────────────────────────────────────────────
interface Asset {
  id:            string
  filename:      string
  category:      string
  visibility?:   string
  partner?:      string
  thumbnailUrl:  string
  blobUrl?:      string
  cloudinaryId?: string
  uploadedAt?:   string
  title?:        string
  meta?:         string
}

// ── Category lookup — case-insensitive (assets use Title case, lib uses lower) ─
const findCat = (id: string) =>
  CATEGORIES.find(c => c.id.toLowerCase() === (id ?? '').toLowerCase())

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const [assets,  setAssets]  = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [view,    setView]    = useState<'grid' | 'table'>('table')
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [toast,   setToast]   = useState<string | null>(null)
  const [copying, setCopying] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API.search}?q=`)
      .then(r => r.json())
      .then(d => setAssets(d.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function copyUrl(url: string, id: string) {
    setCopying(id)
    try {
      await navigator.clipboard.writeText(url)
      showToast('✓ URL copied')
    } catch {
      showToast('✕ Copy failed')
    } finally {
      setTimeout(() => setCopying(null), 800)
    }
  }

  const catCounts = useMemo(() =>
    assets.reduce((acc: Record<string, number>, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1
      return acc
    }, {}),
  [assets])

  const allCats = useMemo(() =>
    Array.from(new Set(assets.map(a => a.category))).sort(),
  [assets])

  const visible = useMemo(() => {
    let list = assets
    if (filter !== 'all') list = list.filter(a => a.category === filter)
    if (search.trim())    list = list.filter(a =>
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [assets, filter, search])

  const totalMb = useMemo(() =>
    assets.reduce((sum, a) => sum + (parseFloat(a.meta ?? '0') || 0), 0),
  [assets])

  return (
    <div style={s.root}>

      {toast && <div style={s.toast}>{toast}</div>}

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <Link href="/dashboard" style={s.backLink}>← Dashboard</Link>
          <div style={s.titleRow}>
            <h1 style={s.title}>◻ Asset Library</h1>
            <div style={s.titleMeta}>
              {loading ? '···' : `${assets.length} assets · ${totalMb.toFixed(1)} MB`}
            </div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.viewToggle}>
            <button
              onClick={() => setView('table')}
              style={{ ...s.viewBtn, ...(view === 'table' ? s.viewBtnActive : {}) }}
            >
              ≡ Table
            </button>
            <button
              onClick={() => setView('grid')}
              style={{ ...s.viewBtn, ...(view === 'grid' ? s.viewBtnActive : {}) }}
            >
              ⊞ Grid
            </button>
          </div>
          <Link href="/dashboard?section=uploads" style={s.uploadBtn}>⬆ Upload</Link>
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={s.filterBar}>
        <input
          type="text"
          placeholder="Search filename or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={s.searchInput}
        />
        <div style={s.pills}>
          <button
            onClick={() => setFilter('all')}
            style={{ ...s.pill, ...(filter === 'all' ? s.pillActive : {}) }}
          >
            All ({assets.length})
          </button>
          {allCats.map(cat => {
            const meta  = findCat(cat)
            const count = catCounts[cat] ?? 0
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{ ...s.pill, ...(filter === cat ? s.pillActive : {}) }}
              >
                {meta ? `${meta.emoji} ` : ''}{cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={s.loadingGrid}>
          {[...Array(8)].map((_, i) => <div key={i} style={s.skel} />)}
        </div>
      ) : visible.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 32 }}>📂</span>
          <span style={s.emptyText}>
            {search || filter !== 'all' ? 'No assets match this filter' : 'No assets yet'}
          </span>
          {(search || filter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilter('all') }}
              style={s.clearBtn}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : view === 'table' ? (
        <TableView assets={visible} onCopy={copyUrl} copying={copying} />
      ) : (
        <GridView assets={visible} onCopy={copyUrl} copying={copying} />
      )}

    </div>
  )
}

// ── TABLE VIEW ────────────────────────────────────────────────────────────────
function TableView({ assets, onCopy, copying }: {
  assets:  Asset[]
  onCopy:  (url: string, id: string) => void
  copying: string | null
}) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['', 'Filename', 'Category', 'Visibility', 'Size', 'Uploaded', 'Actions'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map(a => {
            const vis    = a.visibility || 'public'
            const sizeMb = a.meta?.split(' ')?.[0] ?? '—'
            const date   = a.uploadedAt
              ? new Date(a.uploadedAt).toLocaleDateString()
              : '—'
            const cat    = findCat(a.category)

            return (
              <tr
                key={a.id}
                style={s.tr}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={s.td}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.thumbnailUrl}
                    alt={a.filename}
                    style={s.thumb}
                    onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
                  />
                </td>
                <td style={s.td}>
                  <div style={s.filename}>{a.filename}</div>
                  <div style={s.filemeta}>{a.title}</div>
                </td>
                <td style={s.td}>
                  <span style={s.catBadge}>
                    {cat ? `${cat.emoji} ` : ''}{a.category}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{
                    ...s.visBadge,
                    ...(vis === 'public'  ? s.visPublic  :
                        vis === 'partner' ? s.visPartner :
                                           s.visPrivate),
                  }}>
                    {vis === 'public'  ? '🌐 public'  :
                     vis === 'partner' ? `🤝 ${a.partner ?? 'partner'}` :
                                        '🔒 private'}
                  </span>
                </td>
                <td style={{ ...s.td, ...s.mono }}>{sizeMb} MB</td>
                <td style={{ ...s.td, ...s.mono }}>{date}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button
                      onClick={() => onCopy(a.blobUrl ?? a.thumbnailUrl, a.id)}
                      style={s.actionBtn}
                      title="Copy Blob URL"
                    >
                      {copying === a.id ? '✓' : '⎘ URL'}
                    </button>
                    {a.cloudinaryId && (
                      <a
                        href={`https://console.cloudinary.com/console/media_library/search?q=${encodeURIComponent(a.cloudinaryId)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={s.actionLink}
                        title="Open in Cloudinary"
                      >
                        ☁ CDN
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── GRID VIEW ─────────────────────────────────────────────────────────────────
function GridView({ assets, onCopy, copying }: {
  assets:  Asset[]
  onCopy:  (url: string, id: string) => void
  copying: string | null
}) {
  return (
    <div style={s.grid}>
      {assets.map(a => {
        const vis = a.visibility || 'public'
        const cat = findCat(a.category)
        return (
          <div
            key={a.id}
            style={s.card}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--db-border)')}
          >
            <div style={s.cardThumbWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.thumbnailUrl}
                alt={a.filename}
                style={s.cardThumb}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div style={{
                ...s.cardVisBadge,
                ...(vis === 'public'  ? s.visPublic  :
                    vis === 'partner' ? s.visPartner :
                                       s.visPrivate),
              }}>
                {vis === 'public' ? '🌐' : vis === 'partner' ? '🤝' : '🔒'}
              </div>
            </div>
            <div style={s.cardMeta}>
              <div style={s.filename}>{a.filename}</div>
              <div style={s.filemeta}>
                {cat ? `${cat.emoji} ` : ''}{a.category} · {a.meta?.split(' ')?.[0]} MB
              </div>
              <div style={s.cardActions}>
                <button
                  onClick={() => onCopy(a.blobUrl ?? a.thumbnailUrl, a.id)}
                  style={s.actionBtn}
                >
                  {copying === a.id ? '✓' : '⎘ URL'}
                </button>
                {a.cloudinaryId && (
                  <a
                    href={`https://console.cloudinary.com/console/media_library/search?q=${encodeURIComponent(a.cloudinaryId)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={s.actionLink}
                  >
                    ☁ CDN
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root:          { minHeight: '100vh', background: 'var(--db-bg)', color: 'var(--db-text)', padding: '24px', fontFamily: 'var(--db-font)', position: 'relative' },
  toast:         { position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontFamily: 'var(--db-font-mono)', color: '#c8f564', zIndex: 999 },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  headerLeft:    { display: 'flex', flexDirection: 'column', gap: 6 },
  headerRight:   { display: 'flex', alignItems: 'center', gap: 10 },
  backLink:      { fontSize: 11, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', textDecoration: 'none' },
  titleRow:      { display: 'flex', alignItems: 'baseline', gap: 12 },
  title:         { fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--db-text)' },
  titleMeta:     { fontSize: 11, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },
  viewToggle:    { display: 'flex', border: '1px solid var(--db-border)', borderRadius: 6, overflow: 'hidden' },
  viewBtn:       { background: 'none', border: 'none', padding: '6px 12px', fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', cursor: 'pointer' },
  viewBtnActive: { background: 'var(--db-surface2)', color: 'var(--db-text)' },
  uploadBtn:     { padding: '6px 14px', border: '1px solid var(--db-border)', borderRadius: 6, fontSize: 11, color: 'var(--db-text)', textDecoration: 'none', fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface)' },
  filterBar:     { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  searchInput:   { width: '100%', maxWidth: 360, padding: '8px 12px', background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 6, color: 'var(--db-text)', fontSize: 12, fontFamily: 'var(--db-font-mono)', outline: 'none', boxSizing: 'border-box' },
  pills:         { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pill:          { padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: '1px solid var(--db-border)', background: 'transparent', color: 'var(--db-text-dim)', fontSize: 11, fontFamily: 'var(--db-font-mono)', transition: 'all 0.15s' },
  pillActive:    { background: 'var(--db-surface2)', color: 'var(--db-text)', borderColor: 'rgba(200,245,100,0.3)' },
  loadingGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  skel:          { height: 200, background: 'var(--db-surface)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' },
  empty:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 24px', border: '1px dashed var(--db-border)', borderRadius: 12, textAlign: 'center' },
  emptyText:     { fontSize: 13, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },
  clearBtn:      { padding: '6px 16px', border: '1px solid var(--db-border)', borderRadius: 6, background: 'none', color: 'var(--db-text)', fontSize: 11, fontFamily: 'var(--db-font-mono)', cursor: 'pointer' },
  tableWrap:     { overflowX: 'auto', border: '1px solid var(--db-border)', borderRadius: 10 },
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '10px 14px', fontSize: 9, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--db-text-dim)', textAlign: 'left', borderBottom: '1px solid var(--db-border)', background: 'var(--db-surface)', whiteSpace: 'nowrap' },
  tr:            { borderBottom: '1px solid var(--db-border)', transition: 'background 0.1s' },
  td:            { padding: '10px 14px', fontSize: 11, verticalAlign: 'middle' },
  thumb:         { width: 36, height: 36, borderRadius: 6, objectFit: 'cover', display: 'block', background: 'var(--db-surface2)' },
  filename:      { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 },
  filemeta:      { fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', marginTop: 2 },
  mono:          { fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', fontSize: 11 },
  catBadge:      { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' },
  visBadge:      { fontSize: 9, fontFamily: 'var(--db-font-mono)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' },
  visPublic:     { color: 'var(--db-teal)',  background: 'rgba(0,200,150,0.08)',  border: '1px solid rgba(0,200,150,0.2)'  },
  visPartner:    { color: 'var(--db-amber)', background: 'rgba(255,180,0,0.08)',  border: '1px solid rgba(255,180,0,0.2)'  },
  visPrivate:    { color: 'var(--db-red)',   background: 'rgba(255,94,94,0.08)',  border: '1px solid rgba(255,94,94,0.2)'  },
  actions:       { display: 'flex', gap: 6, alignItems: 'center' },
  actionBtn:     { fontSize: 10, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: 'var(--db-text)', whiteSpace: 'nowrap' },
  actionLink:    { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)', border: '1px solid var(--db-border)', borderRadius: 4, padding: '3px 8px', textDecoration: 'none', background: 'var(--db-surface)', whiteSpace: 'nowrap' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  card:          { background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' },
  cardThumbWrap: { position: 'relative', aspectRatio: '1', background: 'var(--db-surface2)', overflow: 'hidden' },
  cardThumb:     { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardVisBadge:  { position: 'absolute', top: 6, right: 6, fontSize: 10, borderRadius: 4, padding: '2px 5px' },
  cardMeta:      { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  cardActions:   { display: 'flex', gap: 6, marginTop: 4 },
}
