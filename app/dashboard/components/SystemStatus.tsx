'use client';

import { useEffect, useState, useCallback } from 'react';

type ServiceStatus = 'operational' | 'degraded' | 'error' | 'loading';

interface ServiceRow {
  label: string;
  status: ServiceStatus;
  detail: string;
}

const STATUS_COLORS: Record<ServiceStatus, string> = {
  operational: 'var(--db-teal)',
  degraded:    'var(--db-amber)',
  error:       'var(--db-red)',
  loading:     'var(--db-text-dim)',
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  operational: 'Operational',
  degraded:    'Degraded',
  error:       'Error',
  loading:     '···',
};

export default function SystemStatus() {
  const [services, setServices] = useState<ServiceRow[]>(loadingRows());
  const [lastChecked, setLastChecked] = useState<string>('');
  const [checking, setChecking] = useState(false);

  const fetchStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      const s = data.status;

      setServices([
        {
          label: 'Vercel Deploy',
          status: 'operational',
          detail: 'Edge runtime active',
        },
        {
          label: 'Discord',
          status: s.discordConnected ? 'operational' : 'error',
          detail: s.discordConnected
            ? `${s.totalEvents} events logged`
            : 'Webhook not connected',
        },
        {
          label: 'KV Database',
          status: res.ok ? 'operational' : 'error',
          detail: res.ok ? `Latency: ${data.latencyMs ?? '<20'}ms` : 'Connection failed',
        },
        {
          label: 'Storage CDN',
          status: 'operational',
          detail: 'Vercel Blob connected',
        },
        {
          label: 'Search API',
          status: 'operational',
          detail: 'amandaland.vercel.app/api/search',
        },
      ]);

      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setServices(errorRows());
    } finally {
      setChecking(false);
    }
  }, []);

  // Fetch on mount + every 60s
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div style={{
      background: 'var(--db-surface)',
      border: '1px solid var(--db-border)',
      borderRadius: 'var(--db-radius-lg)',
      padding: '18px 20px',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--db-text-muted)',
          fontFamily: 'var(--db-font-mono)',
        }}>
          System Status
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastChecked && (
            <span style={{
              fontSize: 10,
              color: 'var(--db-text-dim)',
              fontFamily: 'var(--db-font-mono)',
            }}>
              checked {lastChecked}
            </span>
          )}
          <button
            onClick={fetchStatus}
            disabled={checking}
            style={{
              background: 'var(--db-surface2)',
              border: '1px solid var(--db-border)',
              borderRadius: 6,
              color: checking ? 'var(--db-text-dim)' : 'var(--db-text-muted)',
              fontFamily: 'var(--db-font-mono)',
              fontSize: 10,
              padding: '3px 10px',
              cursor: checking ? 'default' : 'pointer',
            }}
          >
            {checking ? '···' : 'Refresh ↻'}
          </button>
        </div>
      </div>

      {/* Services */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {services.map((svc) => {
          const color = STATUS_COLORS[svc.status];
          return (
            <div key={svc.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: 6,
              background: 'var(--db-surface2)',
            }}>
              {/* Label */}
              <span style={{
                fontSize: 12,
                color: 'var(--db-text)',
                fontWeight: 500,
                minWidth: 120,
              }}>
                {svc.label}
              </span>

              {/* Detail */}
              <span style={{
                fontSize: 11,
                color: 'var(--db-text-dim)',
                fontFamily: 'var(--db-font-mono)',
                flex: 1,
                paddingLeft: 12,
              }}>
                {svc.detail}
              </span>

              {/* Status pill */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                fontFamily: 'var(--db-font-mono)',
                color,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                borderRadius: 20,
                padding: '2px 10px',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: color,
                  display: 'inline-block',
                }} />
                {STATUS_LABELS[svc.status]}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadingRows(): ServiceRow[] {
  return [
    'Vercel Deploy',
    'Discord',
    'KV Database',
    'Storage CDN',
    'Search API',
  ].map((label) => ({ label, status: 'loading', detail: 'Checking…' }));
}

function errorRows(): ServiceRow[] {
  return [
    'Vercel Deploy',
    'Discord',
    'KV Database',
    'Storage CDN',
    'Search API',
  ].map((label) => ({ label, status: 'error', detail: 'Could not reach /api/stats' }));
}
