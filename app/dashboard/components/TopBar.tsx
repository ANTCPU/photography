'use client';

import { useEffect, useState } from 'react';

type Stats = {
  discordConnected: boolean;
  totalEvents: number;
  topCategory: string | null;
};

export default function TopBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.status))
      .catch(() => setStats(null));
  }, []);

  const badges = stats ? [
    {
      label: stats.discordConnected ? 'Discord: Live' : 'Discord: Offline',
      color: stats.discordConnected ? 'var(--db-teal)' : 'var(--db-red)',
    },
    {
      label: `${stats.totalEvents} Events`,
      color: 'var(--db-blue)',
    },
    {
      label: stats.topCategory ? `Top: ${stats.topCategory}` : 'No Activity',
      color: 'var(--db-amber)',
    },
  ] : [
    { label: '···', color: 'var(--db-text-dim)' },
  ];

  return (
    <div style={{
      height: 'var(--db-topbar-h)',
      borderBottom: '1px solid var(--db-border)',
      background: 'var(--db-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      gap: 12,
      flexShrink: 0,
    }}>

      {/* Left — wordmark */}
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'var(--db-font-mono)',
        letterSpacing: '0.12em',
        color: 'var(--db-text)',
      }}>
        <span style={{ color: 'var(--db-accent)' }}>A</span>MANDA
        <span style={{ color: 'var(--db-text-dim)', margin: '0 6px' }}>/</span>
        <span style={{ color: 'var(--db-text-dim)', fontSize: 10 }}>STUDIO</span>
      </div>

      {/* Right — live badges */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {badges.map((b) => (
          <span key={b.label} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontFamily: 'var(--db-font-mono)',
            color: b.color,
            background: `${b.color}18`,
            border: `1px solid ${b.color}30`,
            borderRadius: 20,
            padding: '3px 10px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: b.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {b.label}
          </span>
        ))}
      </div>

    </div>
  );
}
