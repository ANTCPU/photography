import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export const metadata = {
  title: 'Asset Library — Amanda Studio',
};

export default function AssetsPage() {
  const assets: Asset[] = []; // TODO: wire to GET /api/assets

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
            {assets.length === 0 ? 'No assets yet' : `${assets.length} assets`}
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
        <button style={pill(true)}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} style={pill(false)}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
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
      )}

    </main>
  );
}

type Asset = {
  id: string;
  filename: string;
  url: string;
  category: string;
  uploadedAt: string;
};

function pill(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--db-text)' : 'var(--db-border)'}`,
    background: active ? 'var(--db-text)' : 'transparent',
    color: active ? 'var(--db-bg)' : 'var(--db-text-dim)',
    fontSize: 11, fontFamily: 'var(--db-font-mono)',
  };
}
