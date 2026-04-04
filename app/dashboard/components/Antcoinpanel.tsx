'use client';

import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { AntcoinTransaction } from '../types';

const TX_ICONS: Record<AntcoinTransaction['type'], { symbol: string; bg: string }> = {
  sale:    { symbol: '◇', bg: 'var(--db-amber-dim)' },
  tip:     { symbol: '♡', bg: 'var(--db-teal-dim)'  },
  license: { symbol: '≋', bg: 'var(--db-blue-dim)'  },
};

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AntcoinPanel() {
  const { metrics } = useDashboard();
  const ant = metrics!.antcoin;

  const [liveBalance, setLiveBalance] = useState(ant.balance);
  const [sparkline, setSparkline] = useState(ant.sparkline);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tick live balance
  useEffect(() => {
    const id = setInterval(() => {
      setLiveBalance((prev) => {
        const delta = (Math.random() - 0.4) * 0.8;
        const next = parseFloat((prev + delta).toFixed(2));
        setSparkline((s) => [...s.slice(-19), next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Draw canvas sparkline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;

    const pts = sparkline.map((v, i) => ({
      x: (i / (sparkline.length - 1)) * W,
      y: H - ((v - min) / range) * (H - 8) - 4,
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(181,123,255,0.25)');
    grad.addColorStop(1, 'rgba(181,123,255,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#b57bff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // End dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#b57bff';
    ctx.fill();
  }, [sparkline]);

  const stats = [
    { label: '24h Change',     value: `▲ +${ant.change24h.toFixed(1)} ANT`, up: true  },
    { label: '7d Change',      value: `▲ +${ant.change7d.toFixed(1)} ANT`,  up: true  },
    { label: 'Pending Sales',  value: `+${ant.pending.toFixed(1)} ANT`,      up: null  },
    { label: 'Network Fee',    value: `−${ant.networkFee.toFixed(2)} ANT`,   up: false },
    { label: 'Exchange Rate',  value: `1 ANT = $${ant.exchangeRate.toFixed(2)}`, up: null },
  ];

  return (
    <div
      style={{
        background: 'var(--db-surface)',
        border: '1px solid var(--db-border)',
        borderRadius: 'var(--db-radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--db-border)',
          background: 'linear-gradient(135deg, rgba(181,123,255,0.06) 0%, transparent 60%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--db-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ◈ Antcoin Wallet
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'var(--db-font-mono)',
            color: 'var(--db-purple)',
          }}
        >
          ANT
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        {/* Balance */}
        <div
          style={{
            fontFamily: 'var(--db-font-mono)',
            fontSize: 28,
            fontWeight: 500,
            color: 'var(--db-purple)',
            letterSpacing: '-1px',
          }}
        >
          {liveBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          <span style={{ fontSize: 14, color: 'var(--db-text-dim)' }}>ANT</span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--db-text-dim)',
            fontFamily: 'var(--db-font-mono)',
            marginTop: 3,
          }}
        >
          ≈ ${(liveBalance * ant.exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </div>

        {/* Sparkline */}
        <div style={{ height: 60, margin: '10px 0', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={280}
            height={60}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Stats */}
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--db-text-dim)' }}>{s.label}</span>
            <span
              style={{
                fontFamily: 'var(--db-font-mono)',
                fontSize: 11,
                color:
                  s.up === true
                    ? 'var(--db-teal)'
                    : s.up === false
                    ? 'var(--db-red)'
                    : 'var(--db-text-muted)',
              }}
            >
              {s.value}
            </span>
          </div>
        ))}

        {/* Transactions */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--db-text-dim)',
            margin: '12px 0 6px',
          }}
        >
          Recent Transactions
        </div>

        {ant.recentTx.map((tx) => {
          const { symbol, bg } = TX_ICONS[tx.type];
          return (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  flexShrink: 0,
                  color: 'var(--db-text-muted)',
                }}
              >
                {symbol}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--db-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tx.description}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--db-text-dim)',
                    fontFamily: 'var(--db-font-mono)',
                  }}
                >
                  {formatTimeAgo(tx.timestamp)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--db-font-mono)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: tx.amount > 0 ? 'var(--db-teal)' : 'var(--db-red)',
                  flexShrink: 0,
                }}
              >
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
