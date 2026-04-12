// app/wiki/page.tsx
export default function WikiIndex() {
  return (
    <div style={s.root}>

      <header style={s.topbar}>
        <div style={s.inner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>/</span>WIKI</span>
          <nav style={s.nav}>
            <a href="/" style={s.navLink}>← Home</a>
            <a href="/dashboard" style={s.navLink}>Studio</a>
          </nav>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.inner}>
          <span style={s.badge}>DOCUMENTATION</span>
          <h1 style={s.title}>Docs & Wiki</h1>
          <p style={s.sub}>Architecture, API reference, and project roadmap.</p>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.grid}>
          <WikiCard href="/wiki/api"          icon="⬡" title="API Reference"    desc="All endpoints — search, upload, notify, stats. Request/response examples." />
          <WikiCard href="/wiki/architecture" icon="◈" title="Architecture"     desc="Stack overview — Next.js, Vercel Blob, Upstash KV, Discord webhook." />
          <WikiCard href="/wiki/roadmap"      icon="⚡" title="Roadmap"         desc="What's next, future ideas, and milestone progress." />
          <WikiCard href="/wiki/status"       icon="◎" title="System Status"    desc="Live platform health — Discord, KV, Blob, deployments." />
        </div>
      </div>

      <footer style={s.footer}>
        <div style={s.inner}>
          <span style={s.dim}>AMANDA/PLATFORM · 2026</span>
          <a href="/" style={s.footerLink}>← Back to Home</a>
        </div>
      </footer>

    </div>
  )
}

function WikiCard({ href, icon, title, desc }: {
  href: string; icon: string; title: string; desc: string
}) {
  return (
    <a
      href={href}
      style={s.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(200,245,100,0.25)"
        e.currentTarget.style.background = "#191d27"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
        e.currentTarget.style.background = "#12151c"
      }}
    >
      <span style={s.icon}>{icon}</span>
      <span style={s.cardTitle}>{title}</span>
      <span style={s.cardDesc}>{desc}</span>
      <span style={s.arrow}>→</span>
    </a>
  )
}

const s: Record<string, any> = {
  root:     { minHeight: "100vh", background: "#0b0d11", color: "#e8eaf0", fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:   { borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(11,13,17,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
  inner:    { maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "#e8eaf0", fontFamily: "'IBM Plex Mono', monospace", padding: "16px 0" },
  accent:   { color: "#c8f564" },
  nav:      { display: "flex", gap: 20 },
  navLink:  { color: "#7c8096", textDecoration: "none", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:     { borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 20px 40px" },
  badge:    { display: "inline-block", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", color: "#c8f564", background: "rgba(200,245,100,0.08)", border: "1px solid rgba(200,245,100,0.2)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 },
  title:    { fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#e8eaf0", marginBottom: 10 },
  sub:      { fontSize: 14, color: "#7c8096", lineHeight: 1.7 },
  section:  { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
  grid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
  card:     { background: "#12151c", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "20px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 6, transition: "border-color 0.15s, background 0.15s", cursor: "pointer" },
  icon:     { fontSize: 20, marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" },
  cardTitle:{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" },
  cardDesc: { fontSize: 11, color: "#7c8096", lineHeight: 1.6, flex: 1 },
  arrow:    { fontSize: 12, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },
  footer:   { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px" },
  footerLink: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#c8f564", textDecoration: "none" },
  dim:      { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#4a4f63" },
}
