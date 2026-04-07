// app/page.tsx
// Amanda Photography Platform — Corporate Landing Page
// Public-facing entry point for amandaland.vercel.app

"use client"

import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
  lastEvent: { label: string; timestamp: string } | null
  topCategory: string | null
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AmandaPlatformHome() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() =>
        setStatus({ discordConnected: false, totalEvents: 0, lastEvent: null, topCategory: null })
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.root}>

      {/* ── Top Bar ── */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <div style={styles.wordmark}>
            <span style={styles.wordmarkAccent}>A</span>MANDA
            <span style={styles.wordmarkDivider}>/</span>
            <span style={styles.wordmarkSub}>PLATFORM</span>
          </div>
          <nav style={styles.topNav}>
            <NavLink href="https://antcpu.com/manda" label="↗ Public Site" external />
            <NavLink href="/dashboard" label="Dashboard" />
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>PHOTOGRAPHY PLATFORM</div>
          <h1 style={styles.heroTitle}>
            Amanda<br />
            <span style={styles.heroTitleAccent}>Photography</span>
          </h1>
          <p style={styles.heroSub}>
            A professional platform for visual storytelling — culinary, lifestyle, and travel photography
            powered by a modern serverless backend.
          </p>
          <div style={styles.heroActions}>
            <HeroButton href="https://antcpu.com/manda" primary label="View Portfolio →" />
            <HeroButton href="/dashboard" label="Studio Dashboard" />
          </div>
        </div>
        <div style={styles.heroGrid} aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              ...styles.heroGridCell,
              opacity: Math.random() * 0.12 + 0.03,
            }} />
          ))}
        </div>
      </section>

      {/* ── Platform Stats ── */}
      <section style={styles.section}>
        <SectionLabel>Platform Status</SectionLabel>
        <div style={styles.statsGrid}>
          <StatCard
            label="Public Site"
            value="Live"
            sub="antcpu.com/manda"
            accent="teal"
            loading={false}
            href="https://antcpu.com/manda"
          />
          <StatCard
            label="Discord"
            value={loading ? "—" : status?.discordConnected ? "Connected" : "Offline"}
            sub="Event notifications"
            accent={status?.discordConnected ? "teal" : "red"}
            loading={loading}
          />
          <StatCard
            label="Total Events"
            value={loading ? "—" : String(status?.totalEvents ?? 0)}
            sub="Platform activity"
            accent="blue"
            loading={loading}
          />
          <StatCard
            label="Top Category"
            value={loading ? "—" : status?.topCategory ?? "—"}
            sub="Most viewed"
            accent="purple"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Navigation Cards ── */}
      <section style={styles.section}>
        <SectionLabel>Quick Access</SectionLabel>
        <div style={styles.navGrid}>
          <NavCard
            href="/dashboard"
            icon="⬡"
            title="Studio Dashboard"
            desc="Upload assets, manage portfolio, monitor platform health and next steps."
            accent
          />
          <NavCard
            href="https://antcpu.com/manda"
            icon="◎"
            title="Public Portfolio"
            desc="The live photography site — culinary, lifestyle, and travel visual showcases."
            external
          />
          <NavCard
            href="/api/search?q=nature"
            icon="◈"
            title="Search API"
            desc="Query the photo asset index by filename, category, EXIF, or metadata."
          />
          <NavCard
            href="https://vercel.com/antcpu/amandaland"
            icon="▲"
            title="Vercel Deployments"
            desc="CI/CD pipeline, build logs, environment variables, and edge config."
            external
          />
        </div>
      </section>

      {/* ── Platform Architecture ── */}
      <section style={styles.section}>
        <SectionLabel>Architecture</SectionLabel>
        <div style={styles.archGrid}>
          <ArchRow layer="Frontend" tech="HTML / CSS / JS" host="antcpu.com/manda" status="live" />
          <ArchRow layer="Backend API" tech="Next.js · Edge Runtime" host="amandaland.vercel.app" status="live" />
          <ArchRow layer="Database" tech="Vercel KV (Redis)" host="kv.vercel.com" status="live" />
          <ArchRow layer="Storage CDN" tech="Vercel Blob / CDN" host="US-West" status="degraded" />
          <ArchRow layer="Notifications" tech="Discord Webhook" host="discord.com" status={status?.discordConnected ? "live" : "offline"} />
          <ArchRow layer="Source" tech="GitHub · main branch" host="github.com/ANTCPU/photography" status="live" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerWordmark}>
            <span style={styles.wordmarkAccent}>A</span>MANDA PHOTOGRAPHY
          </span>
          <div style={styles.footerLinks}>
            <FooterLink href="https://antcpu.com/manda" label="Public Site" />
            <FooterLink href="/dashboard" label="Dashboard" />
            <FooterLink href="/api/search?q=" label="API" />
            <FooterLink href="https://github.com/ANTCPU/photography" label="GitHub" />
          </div>
          <span style={styles.footerMeta}>
            © 2026 Antony Ciccone · amandaland.vercel.app
          </span>
        </div>
      </footer>

    </div>
  )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function NavLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={styles.topNavLink}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--db-accent, #c8f564)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#7c8096")}
    >
      {label}
    </a>
  )
}

function HeroButton({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <a href={href} style={primary ? styles.heroBtnPrimary : styles.heroBtnSecondary}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1"
      }}
    >
      {label}
    </a>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.sectionLabel}>{children}</div>
  )
}

function StatCard({
  label, value, sub, accent, loading, href
}: {
  label: string; value: string; sub: string
  accent: "teal" | "blue" | "red" | "purple" | "amber"
  loading: boolean; href?: string
}) {
  const accentColors = {
    teal:   "#34d6a8",
    blue:   "#4da6ff",
    red:    "#ff5e5e",
    purple: "#b57bff",
    amber:  "#f5a623",
  }
  const color = accentColors[accent]
  const inner = (
    <div style={{ ...styles.statCard, borderTopColor: color }}>
      <div style={{ ...styles.statValue, color: loading ? "#4a4f63" : color }}>
        {loading ? "···" : value}
      </div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  )
  return href ? <a href={href} style={{ textDecoration: "none" }}>{inner}</a> : inner
}

function NavCard({
  href, icon, title, desc, accent, external
}: {
  href: string; icon: string; title: string; desc: string; accent?: boolean; external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={styles.navCard}
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
      <div style={{ ...styles.navCardIcon, color: accent ? "#c8f564" : "#7c8096" }}>{icon}</div>
      <div style={styles.navCardTitle}>{title}</div>
      <div style={styles.navCardDesc}>{desc}</div>
      <div style={{ ...styles.navCardArrow, color: accent ? "#c8f564" : "#4a4f63" }}>→</div>
    </a>
  )
}

function ArchRow({
  layer, tech, host, status
}: {
  layer: string; tech: string; host: string; status: "live" | "degraded" | "offline"
}) {
  const statusStyles = {
    live:     { color: "#34d6a8", label: "● live" },
    degraded: { color: "#f5a623", label: "◐ degraded" },
    offline:  { color: "#ff5e5e", label: "○ offline" },
  }
  const s = statusStyles[status]
  return (
    <div style={styles.archRow}>
      <span style={styles.archLayer}>{layer}</span>
      <span style={styles.archTech}>{tech}</span>
      <span style={styles.archHost}>{host}</span>
      <span style={{ ...styles.archStatus, color: s.color }}>{s.label}</span>
    </div>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={styles.footerLink}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c8f564")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4f63")}
    >
      {label}
    </a>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0b0d11",
    color: "#e8eaf0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    lineHeight: 1.6,
  },

  // Topbar
  topbar: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(11,13,17,0.95)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  topbarInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#e8eaf0",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  wordmarkAccent: { color: "#c8f564" },
  wordmarkDivider: { color: "rgba(255,255,255,0.15)", margin: "0 8px" },
  wordmarkSub: { color: "#4a4f63", fontSize: 11 },
  topNav: { display: "flex", gap: 24, alignItems: "center" },
  topNavLink: {
    color: "#7c8096",
    textDecoration: "none",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    transition: "color 0.15s",
    cursor: "pointer",
  },

  // Hero
  hero: {
    position: "relative" as const,
    overflow: "hidden",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "80px 24px 72px",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    position: "relative" as const,
    zIndex: 2,
  },
  heroBadge: {
    display: "inline-block",
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.15em",
    color: "#c8f564",
    background: "rgba(200,245,100,0.08)",
    border: "1px solid rgba(200,245,100,0.2)",
    borderRadius: 20,
    padding: "4px 12px",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "#e8eaf0",
    marginBottom: 20,
  },
  heroTitleAccent: { color: "#c8f564" },
  heroSub: {
    fontSize: 15,
    color: "#7c8096",
    maxWidth: 520,
    marginBottom: 36,
    lineHeight: 1.7,
  },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" as const },
  heroBtnPrimary: {
    display: "inline-block",
    background: "#c8f564",
    color: "#0b0d11",
    fontWeight: 700,
    fontSize: 13,
    padding: "12px 28px",
    borderRadius: 8,
    textDecoration: "none",
    transition: "opacity 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  heroBtnSecondary: {
    display: "inline-block",
    background: "transparent",
    color: "#e8eaf0",
    fontWeight: 500,
    fontSize: 13,
    padding: "12px 28px",
    borderRadius: 8,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "opacity 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  heroGrid: {
    position: "absolute" as const,
    inset: 0,
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    zIndex: 1,
    pointerEvents: "none",
  },
  heroGridCell: {
    border: "1px solid rgba(200,245,100,0.15)",
  },

  // Sections
  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "48px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#4a4f63",
    marginBottom: 20,
  },

  // Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "2px solid",
    borderRadius: 10,
    padding: "20px 20px 18px",
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#e8eaf0",
    fontWeight: 500,
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: "#4a4f63",
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Nav Cards
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  },
  navCard: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "22px 22px 18px",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    transition: "border-color 0.15s, background 0.15s",
    cursor: "pointer",
  },
  navCardIcon: {
    fontSize: 20,
    marginBottom: 4,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  navCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e8eaf0",
  },
  navCardDesc: {
    fontSize: 12,
    color: "#7c8096",
    lineHeight: 1.6,
    flex: 1,
  },
  navCardArrow: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Architecture
  archGrid: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    overflow: "hidden",
  },
  archRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 1fr 100px",
    gap: 16,
    padding: "12px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  archLayer: {
    fontSize: 11,
    fontWeight: 600,
    color: "#e8eaf0",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  archTech: {
    fontSize: 11,
    color: "#7c8096",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  archHost: {
    fontSize: 11,
    color: "#4a4f63",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  archStatus: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    textAlign: "right" as const,
  },

  // Footer
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "28px 24px",
  },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  footerWordmark: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#4a4f63",
  },
  footerLinks: {
    display: "flex",
    gap: 20,
  },
  footerLink: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#4a4f63",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  footerMeta: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#4a4f63",
  },
}
