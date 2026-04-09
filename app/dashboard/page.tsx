'use client';

import { useDashboard } from './context/DashboardContext';
import UploadZone from './components/UploadZone';
import SearchPanel from './components/SearchPanel';

// ── Placeholder stubs (replace one at a time as components are built) ──────

function CategoryPanel() {
  const cats = [
    { name: 'Culinary', status: 'coming soon' },
    { name: 'Lifestyle', status: 'coming soon' },
    { name: 'Travel',   status: 'coming soon' },
  ];
  return (
    <div style={panel}>
      <PanelLabel>📂 Categories</PanelLabel>
      {cats.map((c) => (
        <div key={c.name} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 0', borderBottom: '1px solid var(--db-border)',
        }}>
          <span style={{ color: 'var(--db-text)', fontSize: 12 }}>{c.name}</span>
          <span style={{
            fontSize: 10, fontFamily: 'var(--db-font-mono)',
            color: 'var(--db-amber)', background: 'var(--db-amber-dim)',
            padding: '2px 8px', borderRadius: 20,
          }}>{c.status}</span>
        </div>
      ))}
      <p style={{ color: 'var(--db-text-dim)', fontSize: 11, fontFamily: 'var(--db-font-mono)', marginTop: 12 }}>
        — stub: link to category build pages —
      </p>
    </div>
  );
}

function WhatsNextPanel() {
  const items = [
    { label: 'Discord Server', desc: 'Build out community hub', icon: '💬', status: 'queued' },
    { label: 'Wallpaper Downloads', desc: 'Free download section on main site', icon: '🖼️', status: 'queued' },
    { label: 'Contact Form', desc: 'antcpu.com/manda contact page', icon: '📬', status: 'queued' },
    { label: 'Seed KV Assets', desc: 'Populate search with real photo data', icon: '🗄️', status: 'queued' },
  ];
  return (
    <div style={{ ...panel, gridColumn: '1 / -1' }}>
      <PanelLabel>⚡ What's Next</PanelLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{
            background: 'var(--db-surface2)',
            border: '1px solid var(--db-border)',
            borderRadius: 8, padding: '14px 16px',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--db-border)')}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--db-text)', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--db-text-muted)' }}>{item.desc}</div>
            <div style={{
              marginTop: 10, fontSize: 10, fontFamily: 'var(--db-font-mono)',
              color: 'var(--db-text-dim)',
            }}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdeasPanel() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('amanda-ideas') ?? '[]');
    } catch { return []; }
  });

  function addIdea() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...ideas];
    setIdeas(updated);
    localStorage.setItem('amanda-ideas', JSON.stringify(updated));
    setInput('');
  }

  function removeIdea(i: number) {
    const updated = ideas.filter((_, idx) => idx !== i);
    setIdeas(updated);
    localStorage.setItem('amanda-ideas', JSON.stringify(updated));
  }

  return (
    <div style={{ ...panel, gridColumn: '1 / -1' }}>
      <PanelLabel>💡 Future Ideas</PanelLabel>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addIdea()}
          placeholder="Drop an idea here…"
          style={{
            flex: 1,
            background: 'var(--db-surface2)',
            border: '1px solid var(--db-border)',
            borderRadius: 6,
            color: 'var(--db-text)',
            fontFamily: 'var(--db-font-mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.35)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--db-border)')}
        />
        <button
          onClick={addIdea}
          style={{
            background: 'var(--db-accent-dim)',
            border: '1px solid rgba(200,245,100,0.25)',
            borderRadius: 6,
            color: 'var(--db-accent)',
            fontFamily: 'var(--db-font-mono)',
            fontSize: 12,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          + Add
        </button>
      </div>

      {/* Ideas list */}
      {ideas.length === 0 ? (
        <div style={{
          fontSize: 11,
          color: 'var(--db-text-dim)',
          fontFamily: 'var(--db-font-mono)',
        }}>
          No ideas yet — add one above
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ideas.map((idea, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--db-surface2)',
              border: '1px solid var(--db-border)',
              borderRadius: 6,
              padding: '8px 12px',
            }}>
              <span style={{ fontSize: 12, color: 'var(--db-text)' }}>
                {idea}
              </span>
              <button
                onClick={() => removeIdea(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--db-text-dim)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'var(--db-font-mono)',
                  padding: '0 4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--db-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--db-text-dim)')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function DashFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--db-border)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 8,
    }}>
      <a href="https://antcpu.com/manda" target="_blank" rel="noreferrer"
        style={{ color: 'var(--db-accent)', fontFamily: 'var(--db-font-mono)', fontSize: 11, textDecoration: 'none' }}>
        ↗ antcpu.com/manda
      </a>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <FooterStat label="Live Visitors" value="—" />
        <FooterStat label="Last Deploy" value="2h ago" />
        <FooterStat label="CDN" value="⚠ US-West" color="var(--db-amber)" />
        <FooterStat label="DB Latency" value="12ms" color="var(--db-teal)" />
      </div>
    </footer>
  );
}

function FooterStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 11, color: color ?? 'var(--db-text-muted)', fontFamily: 'var(--db-font-mono)' }}>{value}</div>
    </div>
  );
}

// ── Shared style helpers ───────────────────────────────────────────────────
const panel: React.CSSProperties = {
  background: 'var(--db-surface)',
  border: '1px solid var(--db-border)',
  borderRadius: 'var(--db-radius-lg)',
  padding: '18px 20px',
};

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--db-text-muted)',
      fontFamily: 'var(--db-font-mono)', marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function NavButton({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--db-surface2)',
      border: '1px solid var(--db-border)',
      borderRadius: 8, padding: '8px 16px',
      color: 'var(--db-text)', fontSize: 12,
      fontFamily: 'var(--db-font)',
      textDecoration: 'none', cursor: 'pointer',
      transition: 'border-color 0.15s, color 0.15s',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(200,245,100,0.3)';
        e.currentTarget.style.color = 'var(--db-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--db-border)';
        e.currentTarget.style.color = 'var(--db-text)';
      }}
    >
      {label}
    </a>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--db-bg)',
      color: 'var(--db-text)',
      fontFamily: 'var(--db-font)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Nav Buttons ── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--db-border)',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', marginRight: 8 }}>
          JUMP TO →
        </span>
        <NavButton label="📁 Image Dashboard" href="/dashboard/assets" />
        <NavButton label="⚙️ API Explorer"    href="/api/search?q=test" />
        <NavButton label="🗄️ KV Store"        href="https://vercel.com/antcpu/amandaland/stores" />
        <NavButton label="🚀 Deployments"     href="https://vercel.com/antcpu/amandaland" />
        <NavButton label="↗ Live Site"        href="https://antcpu.com/manda" />
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Panel 1: Image Operations ── */}
        <section>
          <SectionHeader title="Image Operations" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: 16,
          }}>
            <SearchPanel />
            <div style={panel}>
              <PanelLabel>⬆️ Upload</PanelLabel>
              <UploadZone />
            </div>
            <CategoryPanel />
          </div>
        </section>

        {/* ── Panel 2: What's Next ── */}
        <section>
          <SectionHeader title="What's Next" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <WhatsNextPanel />
          </div>
        </section>

        {/* ── Panel 3: Future Ideas ── */}
        <section>
          <SectionHeader title="Future Ideas" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <IdeasPanel />
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <DashFooter />

    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 600, color: 'var(--db-text)',
      marginBottom: 12, paddingBottom: 8,
      borderBottom: '1px solid var(--db-border)',
      fontFamily: 'var(--db-font)',
    }}>
      {title}
    </div>
  );
}
