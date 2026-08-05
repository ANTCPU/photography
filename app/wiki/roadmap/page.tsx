// app/wiki/roadmap/page.tsx
'use client'

import { useState } from 'react'
import Link         from 'next/link'

const milestones = [
  {
    version: 'v0.1',
    label:   'Foundation',
    status:  'complete',
    items: [
      'Image uploader ✅',
      'Discord distribution ✅',
      'Search API ✅',
      'Vercel Blob storage ✅',
      'Upstash KV metadata ✅',
      'Asset visibility system ✅',
    ],
  },
  {
    version: 'v0.2',
    label:   'Studio & Agent',
    status:  'active',
    items: [
      'Dashboard — overview, vault, analytics ✅',
      'Resize engine — social media presets ✅',
      'Cloudinary CDN transforms ✅',
      'Private vault — stage, assign, release ✅',
      'Booking agent — scripted conversation ✅',
      'Splash dash — live control surface ✅',
      'Asset library — table + grid view ✅',
      'Fall 2026 season — live ✅',
    ],
  },
  {
    version: 'v0.3',
    label:   'Commerce & Wallet',
    status:  'planned',
    items: [
      'Antcoin wallet — balance + transactions',
      'Sales history and revenue tracking',
      'License management — commercial usage',
      'Contact form — antcpu.com/manda',
      'Booking capture → Discord notify',
      'OpenAI agent upgrade',
    ],
  },
  {
    version: 'v0.4',
    label:   'Scale & Data',
    status:  'planned',
    items: [
      'Supabase migration — replace KV for queries',
      'Settings — API keys, preferences, profiles',
      'Deploy history — build logs, rollbacks',
      'Wallpaper downloads — free section',
      'Discord community server',
      'Analytics dashboard — real usage data',
    ],
  },
  {
    version: 'v0.5',
    label:   'Platform',
    status:  'planned',
    items: [
      'Multi-photographer support',
      'Client portal — private galleries',
      'Pi Network payment integration',
      'Partner brand self-service',
      'Public API — external platform fetch',
      'Demo story — upload → Discord → API → display',
    ],
  },
]

const queued = [
  { icon: '💬', label: 'Booking capture',      desc: 'Name + email + date → Discord notify on agent booking intent', status: 'next' },
  { icon: '🔑', label: 'OpenAI key',           desc: 'Swap scripted engine for GPT-4o-mini — one function change',   status: 'next' },
  { icon: '📬', label: 'Contact form',         desc: 'antcpu.com/manda contact page — feeds into agent flow',        status: 'queued' },
  { icon: '🖼️', label: 'Wallpaper downloads', desc: 'Free download section on public portfolio site',               status: 'queued' },
  { icon: '◈',  label: 'Antcoin wallet',       desc: 'Real balance, transaction history, Pi Network integration',    status: 'queued' },
  { icon: '🗄️', label: 'Supabase migration',  desc: 'Replace Upstash KV with Supabase for complex queries',         status: 'planned' },
]

const STATUS_COLOR: Record<string, string> = {
  complete: '#34d6a8',
  active:   '#c8f564',
  planned:  '#4a4f63',
  next:     '#c8f564',
  queued:   '#4da6ff',
}

const STATUS_BG: Record<string, string> = {
  complete: 'rgba(52,214,168,0.08)',
  active:   'rgba(200,245,100,0.08)',
  planned:  'rgba(255,255,255,0.04)',
  next:     'rgba(200,245,100,0.08)',
  queued:   'rgba(77,166,255,0.08)',
}

export default function RoadmapPage() {
  const [ideas,  setIdeas]  = useState<string[]>(() => {
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

      {/* Topbar */}
      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span>ROADMAP</span>
          <nav style={s.nav}>
            <Link href="/wiki" style={s.navLink}>← Wiki</Link>
            <Link href="/dashboard" style={s.navLink}>Studio</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>ROADMAP</span>
          <h1 style={s.title}>What's Built. What's Next.</h1>
          <p style={s.sub}>
            v0.2 is live — studio, vault, agent, resize, asset library all deployed.
            v0.3 is commerce and wallet. v0.4 is scale.
          </p>
          <div style={s.pillRow}>
            {[
              { label: 'v0.1 complete ✅', color: '#34d6a8' },
              { label: 'v0.2 active ⚡',   color: '#c8f564' },
              { label: 'v0.3 planned',     color: '#4a4f63' },
            ].map(p => (
              <span key={p.label} style={{ ...s.infoPill, color: p.color, borderColor: `${p.color}30` }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={s.content}>

        {/* Milestones */}
        <div>
          <div style={s.sectionLabel}>MILESTONES</div>
          <div style={s.milestoneGrid}>
            {milestones.map(m => (
              <div key={m.version} style={{
                ...s.milestoneCard,
                borderTopColor: STATUS_COLOR[m.status],
              }}>
                <div style={s.milestoneTop}>
                  <span style={s.version}>{m.version}</span>
                  <span style={{
                    ...s.pill,
                    color:      STATUS_COLOR[m.status],
                    background: STATUS_BG[m.status],
                  }}>
                    {m.status}
                  </span>
                </div>
                <div style={s.milestoneLabel}>{m.label}</div>
                <ul style={s.itemList}>
                  {m.items.map(item => (
                    <li key={item} style={{
                      ...s.item,
                      color: item.includes('✅') ? '#4a4f63' : '#7c8096',
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Queued tasks */}
        <div>
          <div style={s.sectionLabel}>QUEUED TASKS</div>
          <div style={s.taskGrid}>
            {queued.map(item => (
              <div
                key={item.label}
                style={s.taskCard}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <span style={s.taskIcon}>{item.icon}</span>
                <div style={s.taskBody}>
                  <span style={s.taskLabel}>{item.label}</span>
                  <span style={s.taskDesc}>{item.desc}</span>
                </div>
                <span style={{
                  ...s.pill,
                  color:      STATUS_COLOR[item.status],
                  background: STATUS_BG[item.status],
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ideas box */}
        <div>
          <div style={s.sectionLabel}>FUTURE IDEAS</div>
          <div style={s.ideasBox}>
            <div style={s.ideasInput}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIdea()}
                placeholder="Drop an idea here…"
                style={s.input}
                onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.35)')}
                onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              />
              <button onClick={addIdea} style={s.addBtn}>+ Add</button>
            </div>
            {ideas.length === 0
              ? <p style={s.empty}>No ideas yet — add one above</p>
              : ideas.map((idea, i) => (
                <div key={i} style={s.ideaRow}>
                  <span style={s.ideaText}>{idea}</span>
                  <button
                    onClick={() => removeIdea(i)}
                    style={s.removeBtn}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ff5e5e')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4a4f63')}
                  >
                    ✕
                  </button>
                </div>
              ))
            }
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA.STUDIO · ROADMAP · 2026</span>
          <Link href="/wiki" style={s.footerLink}>← Back to Wiki</Link>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
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
  title:         { fontSize: 'clamp(28px, 5vw, 42px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 10, marginTop: 8 },
  sub:           { fontSize: 13, color: '#7c8096', lineHeight: 1.7, marginBottom: 16 },
  pillRow:       { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  infoPill:      { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 10px' },
  content:       { maxWidth: 1100, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 40 },
  sectionLabel:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#4a4f63', marginBottom: 16 },
  milestoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  milestoneCard: { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderTop: '2px solid', borderRadius: 10, padding: '18px' },
  milestoneTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  version:       { fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: '#e8eaf0' },
  pill:          { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", padding: '2px 8px', borderRadius: 20, letterSpacing: '0.1em' },
  milestoneLabel:{ fontSize: 12, fontWeight: 600, color: '#7c8096', marginBottom: 12 },
  itemList:      { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  item:          { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 },
  taskGrid:      { display: 'flex', flexDirection: 'column', gap: 8 },
  taskCard:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s', cursor: 'default' },
  taskIcon:      { fontSize: 18, flexShrink: 0 },
  taskBody:      { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  taskLabel:     { fontSize: 12, fontWeight: 600, color: '#e8eaf0' },
  taskDesc:      { fontSize: 11, color: '#7c8096' },
  ideasBox:      { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 },
  ideasInput:    { display: 'flex', gap: 8 },
  input:         { flex: 1, background: '#191d27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: '8px 12px', outline: 'none', transition: 'border-color 0.15s' },
  addBtn:        { background: 'rgba(200,245,100,0.1)', border: '1px solid rgba(200,245,100,0.2)', color: '#c8f564', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' },
  empty:         { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace", padding: '4px 0', margin: 0 },
  ideaRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  ideaText:      { fontSize: 12, color: '#e8eaf0' },
  removeBtn:     { background: 'none', border: 'none', color: '#4a4f63', cursor: 'pointer', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", transition: 'color 0.15s' },
  footer:        { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:   { maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:           { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
