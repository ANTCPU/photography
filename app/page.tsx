// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { PLACEHOLDERS } from "@/lib/constants"

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
}

export default function AmandaPlatformHome() {
  const [status,     setStatus]     = useState<PlatformStatus | null>(null)
  const [assetCount, setAssetCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setStatus(d.status))
      .catch(() => setStatus({ discordConnected: false, totalEvents: 0 }))
  }, [])

  useEffect(() => {
    fetch("/api/assets")
      .then(r => r.json())
      .then(d => setAssetCount(Array.isArray(d.assets) ? d.assets.length : null))
      .catch(() => setAssetCount(null))
  }, [])

  const discordLive = status?.discordConnected ?? false
  const events      = status?.totalEvents ?? 0

  return (
    <div style={s.root}>

      {/* ── Topbar ── */}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span>STUDIO</span>
          <nav style={s.topNav}>
            <a href="/dashboard/vault" style={s.topNavLink}>Vault</a>
            <a href="/studio"          style={s.topNavLink}>Resize</a>
            <a href="/wiki"            style={s.topNavLink}>Docs</a>
            <a href="/dashboard"       style={s.topNavLogin}>→ Studio</a>
          </nav>
        </div>
      </div>

      {/* ── Hero fold — above the fold CTA ── */}
      <div style={s.heroFold}>
        {/* Background image with overlay */}
        <div style={s.heroFoldBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLACEHOLDERS.banner} alt="" style={s.heroFoldImg} />
          <div style={s.heroFoldOverlay} />
        </div>

        {/* Content */}
        <div style={s.heroFoldContent}>
          <div style={s.heroFoldInner}>

            {/* Badge */}
            <div style={s.badge}>PHOTOGRAPHY PLATFORM · PI NETWORK PARTNER</div>

            {/* Headline */}
            <h1 style={s.heroTitle}>
              Amanda<br />
              <span style={s.accent}>Photography</span>
            </h1>

            {/* Sub */}
            <p style={s.heroSub}>
              Professional image studio for the Pi Network ecosystem.
              Private vault, partner brand assets, social pack delivery
              and a full serverless backend.
            </p>

            {/* CTAs */}
            <div style={s.heroActions}>
              <a href="/dashboard" style={s.btnPrimary}>→ Enter Studio</a>
              <a href="https://antcpu.com/manda" style={s.btnSecondary}>View Portfolio</a>
              <a href="/dashboard/vault" style={s.btnVault}>🔒 Vault</a>
            </div>

            {/* Three pillars */}
            <div style={s.pillars}>
              {[
                { icon: '📸', title: 'Photography Studio',  desc: 'Upload · manage · deliver' },
                { icon: '🤝', title: 'Partner Brands',      desc: 'Map of Pi · Wedding · private vault' },
                { icon: '⚡', title: 'API & Social Pack',   desc: 'Resize · Cloudinary · mega copy' },
              ].map(p => (
                <div key={p.title} style={s.pillar}>
                  <span style={s.pillarIcon}>{p.icon}</span>
                  <div>
                    <div style={s.pillarTitle}>{p.title}</div>
                    <div style={s.pillarDesc}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={s.statusBar}>
        <div style={s.statusInner}>
          <div style={s.statuDot(discordLive)} />
          <span style={s.statusText}>{discordLive ? 'Discord Live' : 'Discord Offline'}</span>
          <span style={s.statusSep}>·</span>
          <span style={s.statusText}>{events} Events</span>
          {assetCount !== null && (
            <>
              <span style={s.statusSep}>·</span>
              <span style={s.statusText}>{assetCount} Public Assets</span>
            </>
          )}
          <span style={s.statusSep}>·</span>
          <a href="https://antcpu.com/manda" style={s.statusLink}>antcpu.com/manda ↗</a>
        </div>
      </div>

      {/* ── Nav Cards ── */}
      <div style={s.section}>
        <div style={s.navGrid}>
          <NavCard href="/dashboard"       icon="⬆" title="Studio Dashboard"  desc="Upload images, manage assets, search your portfolio, and monitor upload status." accent />
          <NavCard href="/dashboard/vault" icon="🔒" title="Private Vault"     desc="Stage images privately for partner brands. Assign to Map of Pi, Wedding, or release public." accent />
          <NavCard href="/ai"              icon="🤖" title="AI Tools"          desc="Resize, enhance, rerender and describe — every image gets smarter from the moment it's uploaded." />
          <NavCard href="/studio"          icon="⚡" title="Resize Engine"     desc="Resize any image to exact social media dimensions across all major platforms." />
          <NavCard href="/api/assets"      icon="◈" title="Assets API"        desc="Public JSON endpoint — filtered by visibility, partner key, and category." />
          <NavCard href="/wiki"            icon="◈" title="Docs & Wiki"        desc="Architecture overview, API reference, roadmap, and platform status." />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerMark}>AMANDA<span style={{ color: '#c8f564' }}>.</span>STUDIO</span>
          <a href="https://antcpu.com" style={s.footerLink}>antcpu.com ↗</a>
          <span style={s.footerCopy}>© 2026 Amanda Photography · Pi Network Partner</span>
        </div>
      </footer>

    </div>
  )
}

// ── NavCard ───────────────────────────────────────────────────────────────────
function NavCard({ href, icon, title, desc, accent }: {
  href: string; icon: string; title: string; desc: string; accent?: boolean
}) {
  return (
    <a href={href} style={s.navCard}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent ? 'rgba(200,245,100,0.35)' : 'rgba(255,255,255,0.12)'
        e.currentTarget.style.background  = '#191d27'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.background  = '#12151c'
      }}>
      <span style={s.navIcon}>{icon}</span>
      <span style={s.navTitle}>{title}</span>
      <span style={s.navDesc}>{desc}</span>
      <span style={s.navArrow}>→</span>
    </a>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, any> = {
  root: { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },

  // Topbar
  topbar:      { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  topbarInner: { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:    { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:      { color: '#c8f564' },
  topNav:      { display: 'flex', gap: 20, alignItems: 'center' },
  topNavLink:  { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  topNavLogin: { color: '#c8f564', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", border: '1px solid rgba(200,245,100,0.25)', borderRadius: 6, padding: '4px 10px' },

  // Hero fold
  heroFold:        { position: 'relative', width: '100%', minHeight: 'clamp(520px, 70vh, 760px)', display: 'flex', alignItems: 'center' },
  heroFoldBg:      { position: 'absolute', inset: 0, overflow: 'hidden' },
  heroFoldImg:     { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  heroFoldOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(11,13,17,0.96) 45%, rgba(11,13,17,0.5) 100%)' },
  heroFoldContent: { position: 'relative', zIndex: 1, width: '100%' },
  heroFoldInner:   { maxWidth: 1100, margin: '0 auto', padding: '60px 40px' },

  // Hero text
  badge:      { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 24 },
  heroTitle:  { fontSize: 'clamp(44px, 7vw, 72px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 20, marginTop: 0 },
  heroSub:    { fontSize: 'clamp(13px, 2vw, 15px)', color: '#7c8096', maxWidth: 460, marginBottom: 36, lineHeight: 1.75 },
  heroActions:{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 },
  btnPrimary: { display: 'inline-block', background: '#c8f564', color: '#0b0d11', fontWeight: 700, fontSize: 13, padding: '12px 28px', borderRadius: 8, textDecoration: 'none' },
  btnSecondary:{ display: 'inline-block', background: 'transparent', color: '#e8eaf0', fontWeight: 500, fontSize: 13, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' },
  btnVault:   { display: 'inline-block', background: 'rgba(255,94,94,0.08)', color: '#ff5e5e', fontWeight: 600, fontSize: 13, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,94,94,0.2)' },

  // Three pillars
  pillars:     { display: 'flex', gap: 32, flexWrap: 'wrap' },
  pillar:      { display: 'flex', alignItems: 'flex-start', gap: 12 },
  pillarIcon:  { fontSize: 20, lineHeight: 1, marginTop: 2 },
  pillarTitle: { fontSize: 12, fontWeight: 700, color: '#e8eaf0', marginBottom: 3 },
  pillarDesc:  { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },

  // Status bar
  statusBar:   { borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#12151c', padding: '0 20px' },
  statusInner: { maxWidth: 1100, margin: '0 auto', height: 40, display: 'flex', alignItems: 'center', gap: 10 },
  statuDot:    (live: boolean) => ({ width: 6, height: 6, borderRadius: '50%', background: live ? '#34d6a8' : '#ff5e5e', flexShrink: 0 }),
  statusText:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096' },
  statusSep:   { fontSize: 11, color: '#4a4f63' },
  statusLink:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', textDecoration: 'none' },

  // Nav cards
  section:  { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  navGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  navCard:  { background: '#12151c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px 20px 16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 5, transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer' },
  navIcon:  { fontSize: 18, marginBottom: 4 },
  navTitle: { fontSize: 13, fontWeight: 600, color: '#e8eaf0' },
  navDesc:  { fontSize: 11, color: '#7c8096', lineHeight: 1.6, flex: 1 },
  navArrow: { fontSize: 13, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },

  // Footer
  footer:      { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px', marginTop: 40 },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerMark:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: '0.15em', color: '#4a4f63' },
  footerLink:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  footerCopy:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
