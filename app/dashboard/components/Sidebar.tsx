'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

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
  { id: 'wallet',     label: 'Wallet',     icon: '◈', section: 'antcoin' },
  { id: 'sales',      label: 'Sales',      icon: '◇', section: 'antcoin' },
  { id: 'licensing',  label: 'Licensing',  icon: '≋', section: 'antcoin' },
  { id: 'settings',   label: 'Settings',   icon: '⚙', section: 'system' },
  { id: 'deploy',     label: 'Deploy',     icon: '▷', section: 'system' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, activeSection, setActiveSection, metrics } =
    useDashboard();

  // Live-tick the Antcoin balance for the sidebar widget
  const [liveBalance, setLiveBalance] = useState(metrics?.antcoin.balance ?? 0);
  const [liveDelta, setLiveDelta] = useState(0);

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

  const sectionLabels: Record<string, string> = {
    core: 'Core',
    antcoin: 'Antcoin',
    system: 'System',
  };

  const grouped = (Object.keys(sectionLabels) as NavItem['section'][]).map((sec) => ({
    key: sec,
    label: sectionLabels[sec],
    items: NAV_ITEMS.filter((n) => n.section === sec),
  }));

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 'var(--db-sidebar-collapsed)' : 'var(--db-sidebar-w)',
        minHeight: '100vh',
        background: 'var(--db-surface)',
        borderRight: '1px solid var(--db-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid var(--db-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(200,245,100,0.05) 0%, transparent 60%)',
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--db-accent)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--db-font-mono)',
            fontSize: 11,
            fontWeight: 500,
            color: '#000',
            flexShrink: 0,
            letterSpacing: '-0.5px',
          }}
        >
          AP
        </div>

        {!sidebarCollapsed && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--db-text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Amanda Studio
          </span>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            background: 'var(--db-surface2)',
            border: '1px solid var(--db-border-accent)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--db-text-muted)',
            fontSize: 9,
            zIndex: 10,
          }}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Live status row */}
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--db-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <LiveDot />
        {!sidebarCollapsed && (
          <span
            style={{
              fontSize: 10,
              color: 'var(--db-teal)',
              fontFamily: 'var(--db-font-mono)',
              fontWeight: 500,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            SYSTEM LIVE
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {grouped.map(({ key, label, items }) => (
          <div key={key}>
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--db-text-dim)',
                  padding: '12px 14px 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </div>
            )}
            {items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    background: isActive ? 'var(--db-accent-dim)' : 'transparent',
                    color: isActive ? 'var(--db-accent)' : 'var(--db-text-muted)',
                    border: 'none',
                    borderLeft: isActive ? '2px solid var(--db-accent)' : '2px solid transparent',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--db-font)',
                    fontSize: 12,
                    transition: 'background 0.12s, color 0.12s',
                  }}
                >
                  <span style={{ width: 16, textAlign: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            background: 'var(--db-red-dim)',
                            color: 'var(--db-red)',
                            borderRadius: 10,
                            padding: '1px 6px',
                            fontSize: 10,
                            fontFamily: 'var(--db-font-mono)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Antcoin mini widget */}
      {!sidebarCollapsed && (
        <div
          style={{
            borderTop: '1px solid var(--db-border)',
            padding: '12px 14px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--db-text-dim)',
              marginBottom: 6,
            }}
          >
            Antcoin Balance
          </div>
          <div
            style={{
              fontFamily: 'var(--db-font-mono)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--db-amber)',
              letterSpacing: '-0.5px',
            }}
          >
            {liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            style={{
              fontSize: 10,
              color: liveDelta >= 0 ? 'var(--db-teal)' : 'var(--db-red)',
              marginTop: 2,
              fontFamily: 'var(--db-font-mono)',
            }}
          >
            {liveDelta >= 0 ? '▲' : '▼'} {Math.abs(liveDelta).toFixed(2)} now
          </div>
        </div>
      )}
    </aside>
  );
}

function LiveDot() {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 7,
        height: 7,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--db-teal)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          background: 'var(--db-teal)',
          opacity: 0.3,
          animation: 'db-pulse 2s ease infinite',
        }}
      />
    </span>
  );
}
