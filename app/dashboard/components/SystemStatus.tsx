'use client';

import type { SystemService } from '../types';

const SERVICES: SystemService[] = [
  { label: 'Vercel Deploy', status: 'operational', detail: 'Last: 2h ago' },
  { label: 'Database',      status: 'operational', detail: 'Latency: 12ms' },
  { label: 'Storage CDN',   status: 'degraded',    detail: 'Slowdown: US-West' },
  { label: 'Antcoin Node',  status: 'operational', detail: 'Block: #447,821' },
];

const STATUS_COLORS: Record<SystemService['status'], string> = {
  operational: 'var(--db-teal)',
  degraded:    'var(--db-amber)',
  error:       'var(--db-red)',
};

const STATUS_LABELS: Record<SystemService['status'], string> = {
  operational: 'Operational',
  degraded:    'Degraded',
  error:       'Error',
};

export default function SystemStatus() {
  return (
    <div
      style={{
        background: 'var(--db-surface)',
        border: '1px solid var(--db-border)',
        borderRadius: 'var(--db-radius-lg)',
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--db-border)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--db-text-muted)',
        }}
      >
        System Status
      </div>

      {/* Services grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {SERVICES.map((svc, i) => {
          const color = STATUS_COLORS[svc.status];
          return (
            <div
              key={svc.label}
              style={{
                padding: '12px 14px',
                borderRight: i < SERVICES.length - 1 ? '1px solid var(--db-border)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--db-text-dim)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {svc.label}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontFamily: 'var(--db-font-mono)',
                }}
              >
                {/* Dot — operational ones pulse via CSS class */}
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                    animation: svc.status === 'operational' ? 'db-pulse 3s ease infinite' : 'none',
                  }}
                />
                <span style={{ color }}>{STATUS_LABELS[svc.status]}</span>
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: 'var(--db-text-dim)',
                  marginTop: 2,
                  fontFamily: 'var(--db-font-mono)',
                }}
              >
                {svc.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
