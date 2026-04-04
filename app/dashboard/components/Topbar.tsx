'use client';

import { useDashboard } from '../context/DashboardContext';

interface StatusBadge {
  label: string;
  color: 'teal' | 'amber' | 'red' | 'blue';
}

const SYSTEM_BADGES: StatusBadge[] = [
  { label: 'Vercel: Live',   color: 'teal'  },
  { label: 'DB Connected',   color: 'teal'  },
  { label: '3 Pending',      color: 'amber' },
];

const DOT_COLORS: Record<StatusBadge['color'], string> = {
  teal:  'var(--db-teal)',
  amber: 'var(--db-amber)',
  red:   'var(--db-red)',
  blue:  'var(--db-blue)',
};

export default function TopBar() {
  const { activeSection, hasUnsavedChanges } = useDashboard();

  const sectionLabel = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);

  return (
    <header
      style={{
        height: 'var(--db-topbar-h)',
        background: 'var(--db-surface)',
        borderBottom: '1px solid var(--db-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <span
        style={{
          fontSize: 12,
          color: 'var(--db-text-dim)',
          fontFamily: 'var(--db-font-mono)',
        }}
      >
        dashboard
      </span>
      <span style={{ color: 'var(--db-text-dim)', fontSize: 12 }}>/</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--db-text)' }}>
        {sectionLabel}
      </span>

      {/* Unsaved indicator */}
      {hasUnsavedChanges && (
        <span
          style={{
            fontSize: 10,
            color: 'var(--db-amber)',
            fontFamily: 'var(--db-font-mono)',
            marginLeft: 4,
          }}
        >
          ● unsaved
        </span>
      )}

      {/* Right: status badges */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {SYSTEM_BADGES.map((badge) => (
          <div
            key={badge.label}
            style={{
              background: 'var(--db-surface3)',
              border: '1px solid var(--db-border-accent)',
              borderRadius: 'var(--db-radius)',
              padding: '4px 10px',
              fontSize: 11,
              color: 'var(--db-text-muted)',
              fontFamily: 'var(--db-font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: DOT_COLORS[badge.color],
                flexShrink: 0,
              }}
            />
            {badge.label}
          </div>
        ))}
      </div>
    </header>
  );
}
