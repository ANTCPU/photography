// app/page.tsx
// Amanda Photography Platform — Landing Page (Cleaned)
"use client"

import { useEffect, useState } from "react"

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
}

export default function AmandaPlatformHome() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus({ discordConnected: false, totalEvents: 0 }))
  }, [])

  const discordLive = status?.discordConnected ?? false
  const events = status?.totalEvents ?? 0

  return (
    <div style={s.root}>

      {/* ── Topbar ── */}
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>/</span>PLATFORM</span>
          <nav style={s.topNav}>
            <a href="/dashboard" style={s.topNavLink}>Studio</a>
            <a href="/wiki" style={s.topNavLink}>Wiki</a>
            <a href="https://antcpu.com/manda" style={s.topNavLink} target="_blank" rel="noreferrer">Portfolio ↗</a>
          </nav>
        </div>
      </header>

      {/* ── Hero Image ── */}
      <div style={s.heroImage}>
        <img
          src="/placeholders/banner.png"
          alt="Amanda Photography"
          style={s.heroImg}
        />
        <div style={s.heroOverlay}>
          <div style={s.heroInner}>
            <span style={s.badge}>PHOTOGRAPHY PLATFORM</span>
            <h1 style={s.heroTitle}>Amanda<br />Photography</h1>
            <p style={s.heroSub}>
              Visual storytelling — culinary, lifestyle, and travel photography
              powered by a modern serverless backend.
            </p>
            <div style={s.heroActions}>
              <a href="https://antcpu.com/manda" style={s.btnPrimary} target="_blank" rel="noreferrer">View Portfolio →</a>
              <a href="/dashboard" style={s.btnSecondary}>Studio Dashboard</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={s.statusBar}>
        <div style={s.statusInner}>
          <span style={s.statusDot(discordLive)} />
          <span style={s.statusText}>
            {discordLive ? "Discord Live" : "Discord Offline"}
          </span>
          <span style={s.statusSep}>·</span>
          <span style={s.statusText}>{events} Events</span>
          <span style={s.statusSep}>·</span>
          <a href="https://antcpu.com/manda" style={s.statusLink} target="_blank" rel="noreferrer">
            antcpu.com/manda ↗
          </a>
        </div>
      </div>

      {/* ── Nav Cards (2 only) ── */}
      <div style={s.section}>
        <div style={s.navGrid}>
          <NavCard
            href="/dashboard"
            icon="◎"
            title="Studio Dashboard"
            desc="Upload assets, manage portfolio, monitor platform health."
            accent
          />
          <NavCard
            href="/studio"
            icon="✦"
            title="AI Studio"
            desc="Resize and reshape images for every social platform automatically."
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerMark}>AMANDA<span style={s.accent}>/</span>PLATFORM</span>
          <a href="/wiki" style={s.footerLink}>→ Docs &amp; Wiki</a>
          <span style={s.footerCopy}>© 2026 Antony Ciccone</span>
        </div>
      </footer>

    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

function NavCard({ href, icon, title, desc, accent }: {
  href: string; icon: string; title: string; desc: string; accent?: boolean
}) {
  return (
    <a
      href={href}
      style={s.navCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent
          ? "rgba(200,245,100,0.35)"
          : "rgba(255,255,255,0.12)"
        e.currentTarget.style.background = "#191d27"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.background = "#12151c"
      }}
    >
      <span style={s.navIcon}>{icon}</span>
      <span style={s.navTitle}>{title}</span>
      <span style={s.navDesc}>{desc}</span>
      <span style={s.navArrow}>→</span>
    </a>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, any> = {
  root: {
    minHeight: "100vh",
    background: "#0b0d11",
    color: "#e8eaf0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
  },
  topbar: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(11,13,17,0.95)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  topbarInner: {
    maxWidth: 1100, margin: "0 auto", padding: "0 20px",
    height: 52, display: "flex", alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.18em",
    color: "#e8eaf0", fontFamily: "'IBM Plex Mono', monospace",
  },
  accent: { color: "#c8f564" },
  topNav: { display: "flex", gap: 20, alignItems: "center" },
  topNavLink: {
    color: "#7c8096", textDecoration: "none", fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Hero Image (full width, image-first)
  heroImage: { position: "relative", width: "100%", height: "clamp(420px, 60vh, 680px)" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to right, rgba(11,13,17,0.85) 40%, rgba(11,13,17,0.2) 100%)",
    display: "flex", alignItems: "center",
  },
  heroInner: { maxWidth: 1100, margin: "0 auto", padding: "0 40px" },
  badge: {
    display: "inline-block", fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em",
    color: "#c8f564", background: "rgba(200,245,100,0.08)",
    border: "1px solid rgba(200,245,100,0.2)", borderRadius: 20,
    padding: "4px 12px", marginBottom: 20,
  },
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700,
    lineHeight: 1.0, letterSpacing: "-0.02em",
    color: "#e8eaf0", marginBottom: 16,
  },
  heroSub: {
    fontSize: "clamp(13px, 2vw, 15px)", color: "#7c8096",
    maxWidth: 440, marginBottom: 32, lineHeight: 1.7,
  },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" as const },
  btnPrimary: {
    display: "inline-block", background: "#c8f564", color: "#0b0d11",
    fontWeight: 700, fontSize: 13, padding: "11px 24px",
    borderRadius: 8, textDecoration: "none",
  },
  btnSecondary: {
    display: "inline-block", background: "transparent", color: "#e8eaf0",
    fontWeight: 500, fontSize: 13, padding: "11px 24px",
    borderRadius: 8, textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  // Status Bar
  statusBar: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "#12151c",
    padding: "0 20px",
  },
  statusInner: {
    maxWidth: 1100, margin: "0 auto", height: 40,
    display: "flex", alignItems: "center", gap: 10,
  },
  statusDot: (live: boolean) => ({
    width: 6, height: 6, borderRadius: "50%",
    background: live ? "#34d6a8" : "#ff5e5e",
    flexShrink: 0,
  }),
  statusText: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#7c8096" },
  statusSep: { fontSize: 11, color: "#4a4f63" },
  statusLink: {
    fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
    color: "#4a4f63", textDecoration: "none",
  },

  // Nav Cards
  section: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
  navGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  navCard: {
    background: "#12151c", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, padding: "20px 20px 16px", textDecoration: "none",
    display: "flex", flexDirection: "column" as const, gap: 5,
    transition: "border-color 0.15s, background 0.15s", cursor: "pointer",
  },
  navIcon: { fontSize: 18, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" },
  navTitle: { fontSize: 13, fontWeight: 600, color: "#e8eaf0" },
  navDesc: { fontSize: 11, color: "#7c8096", lineHeight: 1.6, flex: 1 },
  navArrow: { fontSize: 13, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },

  // Footer
  footer: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", marginTop: 40 },
  footerInner: {
    maxWidth: 1100, margin: "0 auto",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12,
  },
  footerMark: {
    fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700, letterSpacing: "0.15em", color: "#4a4f63",
  },
  footerLink: {
    fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
    color: "#c8f564", textDecoration: "none",
  },
  footerCopy: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },
}
