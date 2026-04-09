// app/page.tsx
// Amanda Photography Platform — Corporate Landing Page
// Web-first, mobile-responsive secondary

"use client"

import { useEffect, useState } from "react"

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
  lastEvent: { label: string; timestamp: string } | null
  topCategory: string | null
}

type RecentEvent = {
  id: string
  type: string
  label: string
  meta: Record<string, string>
  timestamp: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AmandaPlatformHome() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [events, setEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.status)
        setEvents(d.recentEvents ?? [])
      })
      .catch(() =>
        setStatus({ discordConnected: false, totalEvents: 0, lastEvent: null, topCategory: null })
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={s.root}>

      {/* ── Topbar ── */}
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.wordmark}>
            <span style={s.accent}>A</span>MANDA
            <span style={s.dim}> / </span>
            <span style={{ ...s.dim, fontSize: 10 }}>PLATFORM</span>
          </div>
          <nav style={s.topNav}>
            <TopLink href="https://antcpu.com/manda" label="↗ Portfolio" external />
            <TopLink href="/dashboard" label="Dashboard" />
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.badge}>PHOTOGRAPHY PLATFORM</div>
          <h1 style={s.heroTitle}>
            Amanda<br />
            <span style={s.accent}>Photography</span>
          </h1>
          <p style={s.heroSub}>
            A professional platform for visual storytelling — culinary, lifestyle,
            and travel photography powered by a modern serverless backend.
          </p>
          <div style={s.heroActions}>
            <Btn href="https://antcpu.com/manda" label="View Portfolio →" primary />
            <Btn href="/dashboard" label="Studio Dashboard" />
          </div>
        </div>
        {/* Decorative grid */}
        <div style={s.heroGrid} aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={s.heroCell} />
          ))}
        </div>
      </section>

      {/* ── Platform Status ── */}
      <section style={s.section}>
        <SectionLabel>Platform Status</SectionLabel>
        <div style={s.statsGrid}>
          <StatCard label="Public Site" value="Live" sub="antcpu.com/manda"
            accent="teal" loading={false} href="https://antcpu.com/manda" />
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
            sub="Most uploaded"
            accent="purple"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Recent Events ── */}
      <section style={s.section}>
        <SectionLabel>Recent Activity</SectionLabel>
        {loading ? (
          <div style={s.emptyState}>Loading events···</div>
        ) : events.length === 0 ? (
          <div style={s.emptyState}>No events yet — activity will appear here as the platform is used</div>
        ) : (
          <div style={s.eventList}>
            {events.slice(0, 6).map((e) => (
              <div key={e.id} style={s.eventRow}>
                <span style={s.eventLabel}>{e.label}</span>
                <span style={s.eventMeta}>
                  {Object.entries(e.meta ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </span>
                <span style={s.eventTime}>{timeAgo(e.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Quick Access ── */}
      <section style={s.section}>
        <SectionLabel>Quick Access</SectionLabel>
        <div style={s.navGrid}>
          <NavCard href="/dashboard" icon="⬡" title="Studio Dashboard"
            desc="Upload assets, manage portfolio, monitor platform health and next steps."
            accent />
          <NavCard href="https://antcpu.com/manda" icon="◎" title="Public Portfolio"
            desc="The live photography site — culinary, lifestyle, and travel visual showcases."
            external />
          <NavCard href="/dashboard" icon="◈" title="Search Assets"
            desc="Query the photo asset index by filename, category, EXIF, or metadata." />
          <NavCard href="https://vercel.com/antcpus-projects/photography" icon="▲"
            title="Vercel Deployments"
            desc="CI/CD pipeline, build logs, environment variables, and edge config."
            external />
        </div>
      </section>

      {/* ── API Reference ── */}
      <section style={s.section}>
        <SectionLabel>API Reference</SectionLabel>
        <div style={s.apiGrid}>
          <ApiRow
            method="GET"
            path="/api/search?q="
            desc="Search photo assets by filename, category, EXIF or metadata"
            example='{"query":"nature","count":1,"results":[...]}'
          />
          <ApiRow
            method="POST"
            path="/api/notify"
            desc="Send a platform event to Discord and log it to KV"
            example='{"type":"upload_complete","meta":{"filename":"shot.cr2","category":"Nature"}}'
          />
          <ApiRow
            method="GET"
            path="/api/stats"
            desc="Read platform status — Discord health, event count, top category"
            example='{"status":{"discordConnected":true,"totalEvents":4}}'
          />
          <ApiRow
            method="POST"
            path="/api/upload"
            desc="Upload a photo asset to Vercel Blob, write metadata to KV"
            example='FormData: file + category → {ok:true, blobUrl:"...", assetId:"..."}'
          />
        </div>
      </section>

      {/* ── Architecture ── */}
      <section style={s.section}>
        <SectionLabel>Architecture</SectionLabel>
        <div style={s.archGrid}>
          <ArchRow layer="Frontend" tech="HTML / CSS / JS" host="antcpu.com/manda" status="live" />
          <ArchRow layer="Backend API" tech="Next.js · Edge Runtime" host="amandaland.vercel.app" status="live" />
          <ArchRow layer="Database" tech="Upstash Redis (KV)" host="upstash.com" status="live" />
          <ArchRow layer="File Storage" tech="Vercel Blob" host="vercel-storage.com" status="offline" />
          <ArchRow layer="Notifications" tech="Discord Webhook" host="discord.com"
            status={status?.discordConnected ? "live" : "offline"} />
          <ArchRow layer="Source" tech="GitHub · main" host="github.com/ANTCPU/photography" status="live" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerMark}>
            <span style={s.accent}>A</span>MANDA PHOTOGRAPHY
          </span>
          <div style={s.footerLinks}>
            <FLink href="https://antcpu.com/manda" label="Portfolio" />
            <FLink href="/dashboard" label="Dashboard" />
            <FLink href="/api/stats" label="API" />
            <FLink href="https://github.com/ANTCPU/photography" label="GitHub" />
          </div>
          <span style={s.footerCopy}>© 2026 Antony Ciccone</span>
        </div>
      </footer>

    </div>
  )
}

// ─── Components ───────────────────────────────────────────────────────────────

function TopLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}
      style={s.topNavLink}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c8f564")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#7c8096")}
    >{label}</a>
  )
}

function Btn({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <a href={href} style={primary ? s.btnPrimary : s.btnSecondary}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >{label}</a>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={s.sectionLabel}>{children}</div>
}

function StatCard({ label, value, sub, accent, loading, href }: {
  label: string; value: string; sub: string
  accent: "teal" | "blue" | "red" | "purple" | "amber"
  loading: boolean; href?: string
}) {
  const colors = { teal: "#34d6a8", blue: "#4da6ff", red: "#ff5e5e", purple: "#b57bff", amber: "#f5a623" }
  const c = colors[accent]
  const inner = (
    <div style={{ ...s.statCard, borderTopColor: c }}>
      <div style={{ ...s.statValue, color: loading ? "#4a4f63" : c }}>{loading ? "···" : value}</div>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statSub}>{sub}</div>
    </div>
  )
  return href ? <a href={href} style={{ textDecoration: "none" }}>{inner}</a> : inner
}

function NavCard({ href, icon, title, desc, accent, external }: {
  href: string; icon: string; title: string; desc: string; accent?: boolean; external?: boolean
}) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}
      style={s.navCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent ? "rgba(200,245,100,0.35)" : "rgba(255,255,255,0.12)"
        e.currentTarget.style.background = "#191d27"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.background = "#12151c"
      }}
    >
      <div style={{ ...s.navIcon, color: accent ? "#c8f564" : "#7c8096" }}>{icon}</div>
      <div style={s.navTitle}>{title}</div>
      <div style={s.navDesc}>{desc}</div>
      <div style={{ ...s.navArrow, color: accent ? "#c8f564" : "#4a4f63" }}>→</div>
    </a>
  )
}

function ApiRow({ method, path, desc, example }: {
  method: "GET" | "POST"; path: string; desc: string; example: string
}) {
  const methodColor = method === "GET" ? "#34d6a8" : "#f5a623"
  return (
    <div style={s.apiRow}>
      <div style={s.apiTop}>
        <span style={{ ...s.apiMethod, color: methodColor, background: `${methodColor}15`,
          border: `1px solid ${methodColor}30` }}>{method}</span>
        <span style={s.apiPath}>{path}</span>
      </div>
      <div style={s.apiDesc}>{desc}</div>
      <div style={s.apiExample}>{example}</div>
    </div>
  )
}

function ArchRow({ layer, tech, host, status }: {
  layer: string; tech: string; host: string; status: "live" | "degraded" | "offline"
}) {
  const st = { live: { c: "#34d6a8", l: "● live" }, degraded: { c: "#f5a623", l: "◐ degraded" },
    offline: { c: "#ff5e5e", l: "○ offline" } }[status]
  return (
    <div style={s.archRow}>
      <span style={s.archLayer}>{layer}</span>
      <span style={s.archTech}>{tech}</span>
      <span style={s.archHost}>{host}</span>
      <span style={{ ...s.archStatus, color: st.c }}>{st.l}</span>
    </div>
  )
}

function FLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={s.footerLink}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#c8f564")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4f63")}
    >{label}</a>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
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
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  topbarInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#e8eaf0",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  accent: { color: "#c8f564" },
  dim: { color: "#4a4f63" },
  topNav: { display: "flex", gap: 20, alignItems: "center" },
  topNavLink: {
    color: "#7c8096",
    textDecoration: "none",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    transition: "color 0.15s",
  },

  // Hero
  hero: {
    position: "relative",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "64px 20px 56px",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.15em",
    color: "#c8f564",
    background: "rgba(200,245,100,0.08)",
    border: "1px solid rgba(200,245,100,0.2)",
    borderRadius: 20,
    padding: "4px 12px",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 56px)",
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "#e8eaf0",
    marginBottom: 16,
  },
  heroSub: {
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#7c8096",
    maxWidth: 500,
    marginBottom: 32,
    lineHeight: 1.7,
  },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  btnPrimary: {
    display: "inline-block",
    background: "#c8f564",
    color: "#0b0d11",
    fontWeight: 700,
    fontSize: 13,
    padding: "11px 24px",
    borderRadius: 8,
    textDecoration: "none",
    transition: "opacity 0.15s",
  },
  btnSecondary: {
    display: "inline-block",
    background: "transparent",
    color: "#e8eaf0",
    fontWeight: 500,
    fontSize: 13,
    padding: "11px 24px",
    borderRadius: 8,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "opacity 0.15s",
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    zIndex: 1,
    pointerEvents: "none",
  },
  heroCell: { border: "1px solid rgba(200,245,100,0.08)" },

  // Sections
  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#4a4f63",
    marginBottom: 16,
  },

  // Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "2px solid",
    borderRadius: 10,
    padding: "18px 18px 16px",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#e8eaf0", fontWeight: 500, marginBottom: 2 },
  statSub: { fontSize: 10, color: "#4a4f63", fontFamily: "'IBM Plex Mono', monospace" },

  // Events
  eventList: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    overflow: "hidden",
  },
  eventRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr auto",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  eventLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#e8eaf0",
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  eventMeta: {
    fontSize: 10,
    color: "#4a4f63",
    fontFamily: "'IBM Plex Mono', monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  eventTime: {
    fontSize: 10,
    color: "#7c8096",
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: "nowrap" as const,
  },
  emptyState: {
    fontSize: 11,
    color: "#4a4f63",
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "16px 0",
  },

  // Nav Cards
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
  },
  navCard: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "20px 20px 16px",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    transition: "border-color 0.15s, background 0.15s",
    cursor: "pointer",
  },
  navIcon: { fontSize: 18, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" },
  navTitle: { fontSize: 13, fontWeight: 600, color: "#e8eaf0" },
  navDesc: { fontSize: 11, color: "#7c8096", lineHeight: 1.6, flex: 1 },
  navArrow: { fontSize: 13, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace" },

  // API Reference
  apiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12,
  },
  apiRow: {
    background: "#12151c",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  apiTop: { display: "flex", alignItems: "center", gap: 10 },
  apiMethod: {
    fontSize: 9,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "2px 8px",
    borderRadius: 4,
    flexShrink: 0,
  },
  apiPath: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#e8eaf0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  apiDesc: { fontSize: 11, color: "#7c8096", lineHeight: 1.6 },
  apiExample: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#4a4f63",
    background: "#0b0d11",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 6,
    padding: "8px 10px",
    lineHeight: 1.6,
    wordBreak: "break-all" as const,
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
    gridTemplateColumns: "120px 1fr 1fr 90px",
    gap: 12,
    padding: "11px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  archLayer: { fontSize: 11, fontWeight: 600, color: "#e8eaf0", fontFamily: "'IBM Plex Mono', monospace" },
  archTech: { fontSize: 11, color: "#7c8096", fontFamily: "'IBM Plex Mono', monospace" },
  archHost: { fontSize: 10, color: "#4a4f63", fontFamily: "'IBM Plex Mono', monospace" },
  archStatus: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", textAlign: "right" },

  // Footer
  footer: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px" },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  footerMark: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#4a4f63",
  },
  footerLinks: { display: "flex", gap: 16, flexWrap: "wrap" },
  footerLink: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#4a4f63",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  footerCopy: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },
}
