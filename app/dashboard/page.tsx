'use client';

import { useDashboard } from './context/DashboardContext';
import MetricCard from './components/MetricCard';
import SystemStatus from './components/SystemStatus';
import PortfolioTable from './components/PortfolioTable';
import AntcoinPanel from './components/AntcoinPanel';
import UploadZone from './components/UploadZone';

export default function DashboardPage() {
  const { metrics } = useDashboard();

  if (!metrics) return null;

  const { portfolioCount, storageUsedGb, storageTotalGb, revenueUsd, revenueDeltaUsd, antcoin } =
    metrics;

  return (
    <>
      {/* ── Section: Snapshot ── */}
      <SectionHeader title="System Snapshot" action="Refresh ↻" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Portfolio Items"
          value={portfolioCount.toLocaleString()}
          sub="▲ +18 this week"
          subPositive={true}
          accent="accent"
        />
        <MetricCard
          label="Total Storage"
          value={`${storageUsedGb} GB`}
          sub={`of ${storageTotalGb / 1000} TB used`}
          accent="blue"
        />
        <MetricCard
          label="Revenue (USD)"
          value={`$${revenueUsd.toLocaleString()}`}
          sub={`▲ +$${revenueDeltaUsd} today`}
          subPositive={true}
          accent="amber"
        />
        <MetricCard
          label="Antcoin Earned"
          value={`${Math.floor(antcoin.balance).toLocaleString()} ANT`}
          sub={`▲ +${antcoin.change24h.toFixed(1)} today`}
          subPositive={true}
          accent="purple"
        />
      </div>

      {/* ── Section: System Status ── */}
      <SystemStatus />

      {/* ── Section: Portfolio + Antcoin ── */}
      <SectionHeader title="Portfolio & Wallet" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <PortfolioTable />
        <AntcoinPanel />
      </div>

      {/* ── Section: Uploads ── */}
      <SectionHeader title="Upload Queue" action="New Batch ↑" />
      <UploadZone />
    </>
  );
}

/* ── Section header ───────────────────────────────────────────────────────── */

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--db-text-dim)',
        }}
      >
        {title}
      </span>
      {action && (
        <button
          style={{
            fontSize: 11,
            color: 'var(--db-accent)',
            cursor: 'pointer',
            fontFamily: 'var(--db-font-mono)',
            background: 'none',
            border: 'none',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
