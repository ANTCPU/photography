import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { PhotoAsset } from '../types';

export const metadata = {
  title: 'Asset Library — Amanda Studio',
};

// Fetches live from KV via /api/assets at request time
async function getAssets(): Promise<PhotoAsset[]> {
  try {
    const res = await fetch('https://amandaland.vercel.app/api/assets', {
      cache: 'no-store', // always fresh
    });
    const data = await res.json();
    return data.assets ?? [];
  } catch {
    return [];
  }
}

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--db-bg)',
      color: 'var(--db-text)',
      padding: '24px',
      fontFamily: 'var(--db-font)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Link href="/dashboard" style={{
            fontSize: 11, color: 'var(--db-text-dim)',
            fontFamily: 'var(--db-font-mono)', textDecoration: 'none',
          }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 4px' }}>
            📁 Asset Library
          </h1>
          <p style={{ fontSize: 12, color: 'var(--db-text-muted)', fontFamily: 'var(--db-font-mono)' }}>
            {assets.length === 0 ? 'No assets yet' : `${assets.length} asset${assets.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link href="/dashboard" style={{
          padding: '8px 16px', border: '1px solid var(--db-border)',
          borderRadius: 6, fontSize: 12, color: 'var(--db-text)',
          textDecoration: 'none', fontFamily: 'var(--db-font-mono)',
        }}>
          ⬆️ Upload
        </Link>
      </div>

      {/* Category Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        <span style={pill(true)}>All ({assets.length})</span>
        {CATEGORIES.map((cat) => {
          const count = assets.filter(a =>
            a.category.toLowerCase() === cat.label.toLowerCase()
          ).length;
          return (
            <span key={cat.id} style={pill(false)}>
              {cat.emoji} {cat.label} {count > 0 && `(${count})`}
            </span>
          );
        })}
      </div>

      {/* Empty State */}
      {assets.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 24px',
          border: '1px dashed var(--db-border)', borderRadius: 12, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📷</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-text)', marginBottom: 8 }}>
            No assets yet
          </p>
          <p style={{ fontSize: 12, color: 'var(--db-text-muted)', marginBottom: 24 }}>
            Upload images from the dashboard to see them here
          </p>
          <Link href="/dashboard" style={{
            padding: '8px 20px', border: '1px solid var(--db-border)',
            borderRadius: 6, fontSize: 12, color: 'var(--db-text)',
            textDecoration: 'none', fontFamily: 'var(--db-font-mono)',
          }}>
            ⬆️ Go to Upload
          </Link>
        </div>
      ) : (
        /* Asset Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

    </main>
  );
}

// ── Asset Card ──────────────────────────────────────────────────────────────

function AssetCard({ asset }: { asset: PhotoAsset & { blobUrl?: string; uploadedAt?: string } }) {
  const cat = CATEGORIES.find(c =>
    c.label.toLowerCase() === asset.category.toLowerCase()
  );
  const imageUrl = asset.thumbnailUrl ?? asset.blobUrl;

  return (
    <div style={{
      border: '1px solid var(--db-border)',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--db-surface)',
    }}>
      {/* Thumbnail */}
      <div style={{ aspectRatio: '1', background: 'var(--db-surface2)', overflow: 'hidden' }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={asset.filename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--db-text-dim)',
          }}>
            📷
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{
          fontSize: 11, color: 'var(--db-text)',
          fontFamily: 'var(--db-font-mono)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 4,
        }}>
          {asset.filename}
        </p>
        <p style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>
          {cat ? `${cat.emoji} ${cat.label}` : asset.category}
        </p>
        <p style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)', marginTop: 2 }}>
          {asset.meta}
        </p>
        {/* Status badge */}
        <span style={{
          display: 'inline-block', marginTop: 6,
          fontSize: 9, fontFamily: 'var(--db-font-mono)',
          padding: '2px 6px', borderRadius: 20,
          background: asset.status === 'live' ? 'var(--db-teal-dim)' : 'var(--db-amber-dim)',
          color: asset.status === 'live' ? 'var(--db-teal)' : 'var(--db-amber)',
        }}>
          {asset.status}
        </span>
      </div>
    </div>
  );
}

// ── Style helpers ────────────────────────────────────────────────────────────

function pill(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 20, cursor: 'default',
    border: `1px solid ${active ? 'var(--db-text)' : 'var(--db-border)'}`,
    background: active ? 'var(--db-text)' : 'transparent',
    color: active ? 'var(--db-bg)' : 'var(--db-text-dim)',
    fontSize: 11, fontFamily: 'var(--db-font-mono)',
  };
}
