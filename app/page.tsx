// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { PLACEHOLDERS } from "@/lib/constants"

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
}

export default function AmandaPlatformHome() {
  const [status, setStatus]         = useState<PlatformStatus | null>(null)
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
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>.</span></span>
          <nav style={s.topNav}>
            <a href="/dashboard" style={s.topNavLink}>Dashboard</a>
            <a href="/ai"        style={s.topNavLink}>AI</a>
            <a href="/studio"    style={s.topNavLink}>Studio</a>
            <a href="/wiki"      style={s.topNavLink}>Wiki</a>
            <a href="/login"     style={s.topNavLogin}>Sign In →</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={s.heroImage}>
        <img src={PLACEHOLDERS.banner} alt="Amanda Photography" style={s.heroImg} />
        <div style={s.heroOverlay}>
          <div style={s.heroInner}>
            <span style={s.badge}>PHOTOGRAPHY PLATFORM</span>
            <h1 style={s.heroTitle}>Amanda<br />Photography</h1>
            <p style={s.heroSub}>
              Visual storytelling — culinary, lifestyle, and travel photography
              powered by a modern serverless backend.
            </p>
            <div style={s.heroActions}>
              <a href="https://antcpu.com/manda" style={s.btnPrimary}>View Portfolio →</a>
              <a href="/dashboard"               style={s.btnSecondary}>Studio Dashboard</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Status Bar ── */}
      <div style={s.statusBar}>
        <div style={s.statusInner}>
          <div style={s.statusDot(discordLive)} />
          <span style={s.statusText}>{discordLive ? "Discord Live" : "Discord Offline"}</span>
          <span style={s.statusSep}>·</span>
          <span style={s.statusText}>{events} Events</span>
          {assetCount !== null && (
            <>
              <span style={s.statusSep}>·</span>
              <span style={s.statusText}>{assetCount} Assets</span>
            </>
          )}
          <span style={s.statusSep}>·</span>
          <a href="https://antcpu.com/manda" style={s.statusLink}>antcpu.com/manda ↗</a>
        </div>
      </div>

      {/* ── Nav Cards ── */}
      <main style={s.section}>
        <div style={s.navGrid}>
          <NavCard
            href="/dashboard"
            icon="⬆"
            title="Studio Dashboard"
            desc="Upload images, manage assets, search your portfolio, and monitor upload status."
            accent
          />
          <NavCard
            href="/ai"
            icon="🤖"
            title="AI Tools"
            desc="Resize, enhance, rerender and describe — every image gets smarter from the moment it's uploaded."
            accent
          />
          <NavCard
            href="/studio"
            icon="⚡"
            title="Resize Engine"
            desc="Resize any image to exact social media dimensions across all major platforms."
          />
          <NavCard
            href="/wiki"
            icon="◈"
            title="Docs & Wiki"
            desc="Architecture overview, API reference, roadmap, and platform status."
          />
          <NavCard
            href="/wiki/status"
            icon="◎"
            title="System Status"
            desc="Live health checks across all APIs, storage, Discord, and integrations."
          />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerMark}>AMANDA<span style={{ color: "#c8f564" }}>.</span></span>
          <a href="https://antcpu.com/manda" style={s.footerLink}>antcpu.com/manda ↗</a>
          <span style={s.footerCopy}>© {new Date().getFullYear()} Antony Ciccone</span>
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
    <a
      href={href}
      style={s.navCard}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent
          ? "rgba(200,245,100,0.35)"
          : "rgba(255,255,255,0.12)"
        e.currentTarget.style.background = "#191d27"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.background  = "#12151c"
      }}
    >
      <span style={s.navIcon}>{icon}</span>
      <span style={s.navTitle}>{title}</span>
      <span style={s.navDesc}>{desc}</span>
      <span style={s.navArrow}>→</span>
    </a>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, any> = {
  root:        { minHeight: "100vh", background: "#0b0d11", color: "#e8eaf0", fontFamily: "'DM Sans', sans-serif", fontSize: 13 },

  // Topbar
  topbar:      { borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(11,13,17,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
  topbarInner: { maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" },
  wordmark:    { fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#e8eaf0", fontFamily: "'IBM Plex Mono', monospace" },
  accent:      { color: "#c8f564" },
  topNav:      { display: "flex", gap: 20, alignItems: "center" },
  topNavLink:  { color: "#7c8096", textDecoration: "none", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  topNavLogin: { color: "#c8f564", textDecoration: "none", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", border: "1px solid rgba(200,245,100,0.25)", borderRadius: 6, padding: "4px 10px" },

  // Hero
  heroImage:   { position: "relative", width: "100%", height: "clamp(420px, 60vh, 680px)" },
  heroImg:     { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(11,13,17,0.88) 40%, rgba(11,13,17,0.15) 100%)", display: "flex", alignItems: "center" },
  heroInner:   { maxWidth: 1100, margin: "0 auto", padding: "0 40px" },
  badge:       { display: "inline-block", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", color: "#c8f564", background: "rgba(200,245,100,0.08)", border: "1px solid rgba(200,245,100,0.2)", borderRadius: 20, padding: "4px 12px", marginBottom: 20 },
  heroTitle:   { fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#e8eaf0", marginBottom: 16 },
  heroSub:     { fontSize: "clamp(13px, 2vw, 15px)", color: "#7c8096", maxWidth: 440, marginBottom: 32, lineHeight: 1.7 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  btnPrimary:  { display: "inline-block", background: "#c8f564", color: "#0b0d11", fontWeight: 700, fontSize: 13, padding: "11px 24px", borderRadius: 8, textDecoration: "none" },
  btnSecondary:{ display: "inline-block", background: "transparent", color: "#e8eaf0", fontWeight: 500, fontSize: 13, padding: "11px 24px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" },

  // Status bar
  statusBar:   { borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#12151c", padding: "0 20px" },
  statusInner: { maxWidth: 1100, margin: "0 auto", height: 40, display: "flex", alignItems: "center", gap: 10 },
  statusDot:   (live: boolean) => ({ width: 6, height: 6, borderRadius: "50%", background: live ? "#34d6a8" : "#ff5e5e", flexShrink: 0 }),
  statusText:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#7c8096" },
  statusSep:   { fontSize: 11, color: "#4a4f63" },
  statusLink:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63", textDecoration: "none" },

  // Nav cards
  section:     { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
  navGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
  navCard:     { background: "#12151c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "20px 20px 16px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 5, transition: "border-color 0.15s, background 0.15s", cursor: "pointer" },
  navIcon:     { fontSize: 18, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" },
  navTitle:    { fontSize: 13, fontWeight: 600, color: "#e8eaf0" },
  navDesc:     { fontSize: 11, color: "#7c8096", lineHeight: 1.6, flex: 1 },
  navArrow:    { fontSize: 13, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },

  // Footer
  footer:      { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", marginTop: 40 },
  footerInner: { maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  footerMark:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: "0.15em", color: "#4a4f63" },
  footerLink:  { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#c8f564", textDecoration: "none" },
  footerCopy:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },
}
