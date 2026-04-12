// app/wiki/roadmap/page.tsx
'use client'
import { useState } from 'react'

const nextItems = [
  { icon: '💬', label: 'Discord Server',      desc: 'Build out community hub',                  status: 'queued' },
  { icon: '🖼️', label: 'Wallpaper Downloads', desc: 'Free download section on main site',       status: 'queued' },
  { icon: '📬', label: 'Contact Form',         desc: 'antcpu.com/manda contact page',            status: 'queued' },
  { icon: '🗄️', label: 'Seed KV Assets',      desc: 'Populate search with real photo data',     status: 'queued' },
  { icon: '✦',  label: 'AI Studio',            desc: 'Image resize engine for social platforms', status: 'in progress' },
  { icon: '📦', label: 'Persistent Storage',   desc: 'Vercel Blob + KV metadata',               status: 'in progress' },
]

const milestones = [
  { version: 'v0.1', label: 'Upload & Store',          status: 'active',  items: ['Image uploader ✅', 'Discord distribution ✅', 'Search ✅', 'Persistent storage ⏳', 'Metadata ⏳'] },
  { version: 'v0.2', label: 'Enhance & Contextualize', status: 'planned', items: ['Auto-tag images', 'Add descriptions', 'AI Studio resize engine'] },
  { version: 'v0.3', label: 'Share via API',            status: 'planned', items: ['GET /api/image/{id}', 'External platform fetch'] },
  { version: 'v0.4', label: 'Dashboard & Analytics',   status: 'planned', items: ['Upload history', 'API usage stats'] },
  { version: 'v0.5', label: 'Demo Story',               status: 'planned', items: ['Upload → Discord → API → external display'] },
]

export default function RoadmapPage() {
  const [ideas, setIdeas] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('amanda-ideas') ?? '[]') }
    catch { return [] }
  })
  const [input, setInput] = useState('')

  function addIdea() {
    const t = input.trim()
    if (!t) return
    const updated = [t, ...ideas]
    setIdeas(updated)
    localStorage.setItem('amanda-ideas', JSON.stringify(updated))
    setInput('')
  }

  function removeIdea(i: number) {
    const updated = ideas.filter((_, idx) => idx !== i)
    setIdeas(updated)
    localStorage.setItem('amanda-ideas', JSON.stringify(updated))
  }

  return (
    <div style={s.root}>

      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>/</span>ROADMAP</span>
          <nav style={s.nav}>
            <a href="/wiki" style={s.navLink}>← Wiki</a>
            <a href="/dashboard" style={s.navLink}>Studio</a>
          </nav>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>ROADMAP</span>
          <h1 style={s.title}>What's Next</h1>
          <p style={s.sub}>Milestone progress, queued tasks, and future ideas.</p>
        </div>
      </div>

      {/* Milestones */}
      <div style={s.section}>
        <div style={s.sectionLabel}>MILESTONES</div>
        <div style={s.milestoneGrid}>
          {milestones.map((m) => (
            <div key={m.version} style={{ ...s.milestoneCard, borderTopColor: m.status === 'active' ? '#c8f564' : 'rgba(255,255,255,0.06)' }}>
              <div style={s.milestoneTop}>
                <span style={s.version}>{m.version}</span>
                <span style={{ ...s.pill, background: m.status === 'active' ? 'rgba(200,245,100,0.1)' : 'rgba(255,255,255,0.04)', color: m.status === 'active' ? '#c8f564' : '#4a4f63' }}>
                  {m.status}
                </span>
              </div>
              <div style={s.milestoneLabel}>{m.label}</div>
              <ul style={s.itemList}>
                {m.items.map((item) => <li key={item} style={s.item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* What's Next */}
      <div style={s.section}>
        <div style={s.sectionLabel}>QUEUED TASKS</div>
        <div style={s.taskGrid}>
          {nextItems.map((item) => (
            <div key={item.label} style={s.taskCard}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={s.taskIcon}>{item.icon}</span>
              <div style={s.taskBody}>
                <span style={s.taskLabel}>{item.label}</span>
                <span style={s.taskDesc}>{item.desc}</span>
              </div>
              <span style={{ ...s.pill, background: item.status === 'in progress' ? 'rgba(77,166,255,0.1)' : 'rgba(255,255,255,0.04)', color: item.status === 'in progress' ? '#4da6ff' : '#4a4f63' }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ideas */}
      <div style={s.section}>
        <div style={s.sectionLabel}>FUTURE IDEAS</div>
        <div style={s.ideasBox}>
          <div style={s.ideasInput}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIdea()}
              placeholder="Drop an idea here…"
              style={s.input}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.35)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
            <button onClick={addIdea} style={s.addBtn}>+ Add</button>
          </div>
          {ideas.length === 0
            ? <p style={s.empty}>No ideas yet — add one above</p>
            : ideas.map((idea, i) => (
              <div key={i} style={s.ideaRow}>
                <span style={s.ideaText}>{idea}</span>
                <button onClick={() => removeIdea(i)} style={s.removeBtn}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ff5e5e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4a4f63')}
                >✕</button>
              </div>
            ))
          }
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

const s: Record<string, any> = {
  root:          { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:        { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  inner:         { maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  wordmark:      { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:        { color: '#c8f564' },
  nav:           { display: 'flex', gap: 20 },
  navLink:       { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:          { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px 40px' },
  heroInner:     { maxWidth: 1100, margin: '0 auto' },
  badge:         { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 },
  title:         { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10 },
  sub:           { fontSize: 14, color: '#7c8096', lineHeight: 1.7 },
  section:       { maxWidth: 1100, margin: '0 auto', padding: '32px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  sectionLabel:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63', marginBottom: 16 },
  milestoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  milestoneCard: { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderTop: '2px solid', borderRadius: 10, padding: '16px' },
  milestoneTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  version:       { fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: '#e8eaf0' },
  pill:          { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", padding: '2px 8px', borderRadius: 20, letterSpacing: '0.1em' },
  milestoneLabel:{ fontSize: 12, fontWeight: 600, color: '#7c8096', marginBottom: 10 },
  itemList:      { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 },
  item:          { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },
  taskGrid:      { display: 'flex', flexDirection: 'column', gap: 8 },
  taskCard:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s', cursor: 'default' },
  taskIcon:      { fontSize: 18, flexShrink: 0 },
  taskBody:      { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  taskLabel:     { fontSize: 12, fontWeight: 600, color: '#e8eaf0' },
  taskDesc:      { fontSize: 11, color: '#7c8096' },
  ideasBox:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 },
  ideasInput:    { display: 'flex', gap: 8 },
  input:         { flex: 1, background: '#191d27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: '8px 12px', outline: 'none', transition: 'border-color 0.15s' },
  addBtn:        { background: 'rgba(200,245,100,0.1)', border: '1px solid rgba(200,245,100,0.2)', color: '#c8f564', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' },
  empty:         { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace", padding: '4px 0' },
  ideaRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  ideaText:      { fontSize: 12, color: '#e8eaf0' },
  removeBtn:     { background: 'none', border: 'none', color: '#4a4f63', cursor: 'pointer', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", transition: 'color 0.15s' },
  footer:        { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:   { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:           { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
