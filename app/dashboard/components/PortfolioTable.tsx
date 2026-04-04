'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { PhotoAsset, PhotoStatus } from '../types';

type SortKey = 'filename' | 'category' | 'status' | 'priceUsd' | 'antcoin';
type FilterStatus = 'all' | PhotoStatus;
type AssetTab = 'photos' | 'videos' | 'prints' | 'licenses';

export default function PortfolioTable() {
  const { assets } = useDashboard();

  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('filename');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [activeTab, setActiveTab] = useState<AssetTab>('photos');

  // Simulate async data load
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const sorted = useMemo(() => {
    let rows = filterStatus === 'all'
      ? assets
      : assets.filter((a) => a.status === filterStatus);

    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return rows;
  }, [assets, sortKey, sortAsc, filterStatus]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(true); }
  }

  const FILTER_BTNS: FilterStatus[] = ['all', 'live', 'draft', 'sold', 'review'];
  const TABS: AssetTab[] = ['photos', 'videos', 'prints', 'licenses'];

  return (
    <div
      style={{
        background: 'var(--db-surface)',
        border: '1px solid var(--db-border)',
        borderRadius: 'var(--db-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Table header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--db-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--db-text)' }}>
          Recent Portfolio — Photo Assets
        </span>

        {/* Filter toolbar */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_BTNS.map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                background: filterStatus === f ? 'var(--db-accent-dim)' : 'var(--db-surface2)',
                border: `1px solid ${filterStatus === f ? 'rgba(200,245,100,0.25)' : 'var(--db-border)'}`,
                borderRadius: 6,
                color: filterStatus === f ? 'var(--db-accent)' : 'var(--db-text-muted)',
                padding: '4px 10px',
                fontSize: 10,
                fontFamily: 'var(--db-font-mono)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Asset type tabs */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          margin: '10px 12px 0',
          background: 'var(--db-surface2)',
          padding: 3,
          borderRadius: 8,
          width: 'fit-content',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: activeTab === tab ? 'var(--db-text)' : 'var(--db-text-muted)',
              background: activeTab === tab ? 'var(--db-surface)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'var(--db-font)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th style={{ width: 42 }}></Th>
              <SortTh label="File Name"  sortKey="filename" current={sortKey} asc={sortAsc} onClick={handleSort} />
              <SortTh label="Category"   sortKey="category" current={sortKey} asc={sortAsc} onClick={handleSort} />
              <SortTh label="Status"     sortKey="status"   current={sortKey} asc={sortAsc} onClick={handleSort} />
              <SortTh label="Price"      sortKey="priceUsd" current={sortKey} asc={sortAsc} onClick={handleSort} />
              <SortTh label="ANT"        sortKey="antcoin"  current={sortKey} asc={sortAsc} onClick={handleSort} />
              <Th>EXIF</Th>
              <Th style={{ width: 60 }}></Th>
            </tr>
          </thead>
          <tbody>
            {!loaded
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              : sorted.map((asset) => <AssetRow key={asset.id} asset={asset} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        padding: '8px 12px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--db-text-dim)',
        textAlign: 'left',
        borderBottom: '1px solid var(--db-border)',
        background: 'var(--db-surface2)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function SortTh({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (k: SortKey) => void;
}) {
  const active = sortKey === current;
  return (
    <th
      onClick={() => onClick(sortKey)}
      style={{
        padding: '8px 12px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: active ? 'var(--db-accent)' : 'var(--db-text-dim)',
        textAlign: 'left',
        borderBottom: '1px solid var(--db-border)',
        background: 'var(--db-surface2)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {label} {active && <span style={{ fontSize: 8 }}>{asc ? '▲' : '▼'}</span>}
    </th>
  );
}

function AssetRow({ asset }: { asset: PhotoAsset }) {
  return (
    <tr
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--db-surface2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Thumbnail placeholder */}
      <td style={{ padding: '10px 12px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: 'var(--db-surface3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'var(--db-text-dim)',
            fontFamily: 'var(--db-font-mono)',
          }}
        >
          ◼
        </div>
      </td>

      {/* Name + meta */}
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--db-text)' }}>
          {asset.filename}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--db-text-dim)',
            fontFamily: 'var(--db-font-mono)',
            marginTop: 1,
          }}
        >
          {asset.meta}
        </div>
      </td>

      {/* Category */}
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--db-text-muted)' }}>
        {asset.category}
      </td>

      {/* Status pill */}
      <td style={{ padding: '10px 12px' }}>
        <StatusPill status={asset.status} />
      </td>

      {/* Price */}
      <td style={{ padding: '10px 12px' }}>
        <span
          style={{
            fontFamily: 'var(--db-font-mono)',
            fontSize: 12,
            color: 'var(--db-amber)',
          }}
        >
          {asset.priceUsd != null ? `$${asset.priceUsd}` : '—'}
        </span>
      </td>

      {/* ANT */}
      <td style={{ padding: '10px 12px' }}>
        <span
          style={{
            fontFamily: 'var(--db-font-mono)',
            fontSize: 12,
            color: 'var(--db-purple)',
          }}
        >
          {asset.antcoin != null ? `+${asset.antcoin}` : '—'}
        </span>
      </td>

      {/* EXIF */}
      <td style={{ padding: '10px 12px' }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'var(--db-font-mono)',
            color: 'var(--db-text-dim)',
          }}
        >
          {asset.exif}
        </span>
      </td>

      {/* Action */}
      <td style={{ padding: '10px 12px' }}>
        <button
          style={{
            background: 'none',
            border: '1px solid var(--db-border)',
            borderRadius: 4,
            color: 'var(--db-text-muted)',
            padding: '3px 7px',
            cursor: 'pointer',
            fontSize: 10,
            fontFamily: 'var(--db-font)',
          }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: PhotoStatus }) {
  const classMap: Record<PhotoStatus, string> = {
    live:   'db-pill--live',
    draft:  'db-pill--draft',
    sold:   'db-pill--sold',
    review: 'db-pill--review',
  };
  return (
    <span className={`db-pill ${classMap[status]}`}>
      <span className="db-pill__dot" />
      {status}
    </span>
  );
}

function SkeletonRow() {
  const sk = (w: number, h = 10) => (
    <div className="db-skeleton" style={{ width: w, height: h, borderRadius: h / 2 }} />
  );
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td style={{ padding: '10px 12px' }}>{sk(36, 36)}</td>
      <td style={{ padding: '10px 12px' }}>
        {sk(120)}
        <div style={{ marginTop: 4 }}>{sk(70, 8)}</div>
      </td>
      <td style={{ padding: '10px 12px' }}>{sk(60)}</td>
      <td style={{ padding: '10px 12px' }}>{sk(50, 18)}</td>
      <td style={{ padding: '10px 12px' }}>{sk(45)}</td>
      <td style={{ padding: '10px 12px' }}>{sk(45)}</td>
      <td style={{ padding: '10px 12px' }}>{sk(90)}</td>
      <td />
    </tr>
  );
}
