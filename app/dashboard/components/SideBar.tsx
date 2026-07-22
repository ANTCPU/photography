'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { PLACEHOLDERS } from '@/lib/constants';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  section: 'core' | 'antcoin' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',   label: 'Overview',   icon: '⬡', section: 'core' },
  { id: 'portfolio',  label: 'Portfolio',  icon: '◻', section: 'core' },
  { id: 'uploads',    label: 'Uploads',    icon: '↑', section: 'core', badge: 3 },
  { id: 'analytics',  label: 'Analytics',  icon: '∿', section: 'core' },
  { id: 'vault',      label: 'Vault',      icon: '🔒', section: 'core' },
  { id: 'wallet',     label: 'Wallet',     icon: '◈', section: 'antcoin' },
  { id: 'sales',      label: 'Sales',      icon: '◇', section: 'antcoin' },
  { id: 'licensing',  label: 'Licensing',  icon: '≋', section: 'antcoin' },
  { id: 'settings',   label: 'Settings',   icon: '⚙', section: 'system' },
  { id: 'deploy',     label: 'Deploy',     icon: '▷', section: 'system' },
];

export default function Sidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    activeSection,
    setActiveSection,
    metrics,
  } = useDashboard();

  // Live-tick the Antcoin balance for the sidebar widget
  const [isMobile, setIsMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
    router.push('/login')
  }
  const [liveBalance, setLiveBalance] = useState(metrics?.antcoin.balance ?? 0);
  const [liveDelta,   setLiveDelta]   = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveBalance((prev) => {
        const delta = (Math.random() - 0.4) * 0.8;
        setLiveDelta(delta);
        return parseFloat((prev + delta).toFixed(2));
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
      else setSidebarCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  const sectionLabels: Record<string, string> = {
    core:    'Core',
    antcoin: 'Antcoin',
    system:  'System',
  };

  const grouped = (Object.keys(sectionLabels) as NavItem['section'][]).map((sec) => ({
    key:   sec,
    label: sectionLabels[sec],
    items: NAV_ITEMS.filter((n) => n.section === sec),
  }));

  const w = sidebarCollapsed ? 56 : 200;

  return (
    <>
    {/* Mobile overlay backdrop */}
    {isMobile && !sidebarCollapsed && (
      <div
        onClick={() => {
  if (item.id === 'vault') {
    router.push('/dashboard/vault')
  } else {
    setActiveSection(item.id)
    if (isMobile) setSidebarCollapsed(true)
  }
}}

        style={{
          position: 'fixed', inset: 0, top: 52,
          background: 'rgba(0,0,0,0.6)', zIndex: 19,
        }}
      />
    )}
    <aside style={{
      width: isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
      minWidth: isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
      maxWidth: isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
      background: 'var(--db-surface)',
      borderRight: '1px solid var(--db-border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? 52 : 0,
      left: 0,
      transition: 'width 0.25s, min-width 0.25s',
      overflow: 'hidden', zIndex: 20,
    }}>

      {/* ── Profile ── */}
      <div style={{
        padding: sidebarCollapsed ? '16px 0' : '16px 14px',
        borderBottom: '1px solid var(--db-border)',
        display: 'flex',
        flexDirection: sidebarCollapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Avatar — profile.png */}
        <img
          src={PLACEHOLDERS.profile}
          alt="Amanda"
          style={{
            width: 32, height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid rgba(200,245,100,0.25)',
          }}
        />

        {/* Name + handle — hidden when collapsed */}
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--db-text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Amanda
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'var(--db-font-mono)',
              color: 'var(--db-text-dim)',
              whiteSpace: 'nowrap',
            }}>
              @antcpu
            </div>
          </div>
        )}

        {/* Collapse toggle — pushed to right when expanded */}
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--db-text-dim)', cursor: 'pointer', fontSize: 14,
              padding: '2px 4px', lineHeight: 1,
            }}
            title="Collapse sidebar"
          >
            ‹
          </button>
        )}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--db-text-dim)', cursor: 'pointer', fontSize: 14,
              padding: '2px 4px', lineHeight: 1,
            }}
            title="Expand sidebar"
          >
            ›
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {grouped.map(({ key, label, items }) => (
          <div key={key} style={{ marginBottom: 4 }}>
            {/* Section label — hidden when collapsed */}
            {!sidebarCollapsed && (
              <div style={{
                fontSize: 9, fontFamily: 'var(--db-font-mono)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--db-text-dim)', padding: '8px 14px 4px',
              }}>
                {label}
              </div>
            )}
            {items.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: sidebarCollapsed ? '9px 0' : '9px 14px',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    background: active ? 'rgba(200,245,100,0.07)' : 'none',
                    border: 'none',
                    borderLeft: active ? '2px solid #c8f564' : '2px solid transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    fontSize: 14, lineHeight: 1,
                    color: active ? 'var(--db-accent)' : 'var(--db-text-dim)',
                    fontFamily: 'var(--db-font-mono)',
                  }}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span style={{
                      fontSize: 12, color: active ? 'var(--db-text)' : 'var(--db-text-muted)',
                      fontWeight: active ? 600 : 400, flex: 1, textAlign: 'left',
                    }}>
                      {item.label}
                    </span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--db-font-mono)',
                      background: 'rgba(200,245,100,0.12)',
                      color: 'var(--db-accent)',
                      border: '1px solid rgba(200,245,100,0.2)',
                      borderRadius: 10, padding: '1px 6px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Antcoin Widget ── */}
      {!sidebarCollapsed && (
        <div style={{
          borderTop: '1px solid var(--db-border)',
          padding: '12px 14px',
        }}>
          <div style={{
            fontSize: 9, fontFamily: 'var(--db-font-mono)',
            letterSpacing: '0.12em', color: 'var(--db-text-dim)',
            textTransform: 'uppercase', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <LiveDot />
            Antcoin
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: 'var(--db-text)', fontFamily: 'var(--db-font-mono)',
            letterSpacing: '-0.02em',
          }}>
            {liveBalance.toFixed(2)}
            <span style={{ fontSize: 10, color: 'var(--db-text-dim)', marginLeft: 4 }}>ANT</span>
          </div>
          <div style={{
            fontSize: 10, fontFamily: 'var(--db-font-mono)',
            color: liveDelta >= 0 ? 'var(--db-teal)' : 'var(--db-red)',
            marginTop: 2,
          }}>
            {liveDelta >= 0 ? '+' : ''}{liveDelta.toFixed(2)} live
          </div>
        </div>
      )}

      {/* ── Sign Out ── */}
      {!sidebarCollapsed && (
        <div style={{ borderTop: '1px solid var(--db-border)', padding: '12px 14px' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', background: 'none',
              border: '1px solid var(--db-border)',
              borderRadius: 6, padding: '8px 10px',
              color: 'var(--db-red)', cursor: 'pointer',
              fontSize: 11, fontFamily: 'var(--db-font-mono)',
              textAlign: 'left', transition: 'border-color 0.15s',
            }}
          >
            {loggingOut ? '···' : '← sign out'}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}

function LiveDot() {
  return (
    <span style={{
      display: 'inline-block', width: 5, height: 5,
      borderRadius: '50%', background: 'var(--db-teal)',
      boxShadow: '0 0 4px var(--db-teal)',
    }} />
  );
}
