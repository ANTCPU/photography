'use client';

import { useState, useEffect, useRef } from 'react';

type SearchResult = {
  id: string;
  title: string;
  filename: string;
  category: string;
  status: string;
  thumbnailUrl: string;
  priceUsd: number | null;
  antcoin: number | null;
};

const STATUS_COLORS: Record<string, string> = {
  live:    'var(--db-teal)',
  draft:   'var(--db-text-dim)',
  sold:    'var(--db-amber)',
  review:  'var(--db-blue)',
};

export default function SearchPanel() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [count, setCount]       = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [empty, setEmpty]       = useState(false);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear if query wiped
    if (!query.trim()) {
      setResults([]);
      setCount(null);
      setEmpty(false);
      setError('');
      return;
    }

    // Debounce 350ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      setEmpty(false);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setCount(data.count ?? 0);
        setEmpty((data.count ?? 0) === 0);
      } catch {
        setError('Search failed — check API');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div style={{
      background: 'var(--db-surface)',
      border: '1px solid var(--db-border)',
      borderRadius: 'var(--db-radius-lg)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>

      {/* Label */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--db-text-muted)',
        fontFamily: 'var(--db-font-mono)',
      }}>
        🔍 Search Assets
      </span>

      {/* Input */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filename, category, EXIF…"
          style={{
            width: '100%',
            background: 'var(--db-surface2)',
            border: '1px solid var(--db-border)',
            borderRadius: 6,
            color: 'var(--db-text)',
            fontFamily: 'var(--db-font-mono)',
            fontSize: 12,
            padding: '8px 36px 8px 12px',
            outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = 'rgba(200,245,100,0.35)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = 'var(--db-border)')
          }
        />
        {/* Loading spinner / clear */}
        <span style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 11,
          color: 'var(--db-text-dim)',
          fontFamily: 'var(--db-font-mono)',
          cursor: query ? 'pointer' : 'default',
        }}
          onClick={() => query && setQuery('')}
        >
          {loading ? '···' : query ? '✕' : ''}
        </span>
      </div>

      {/* Count badge */}
      {count !== null && !loading && (
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--db-font-mono)',
          color: count > 0 ? 'var(--db-accent)' : 'var(--db-text-dim)',
        }}>
          {count > 0 ? `${count} result${count !== 1 ? 's' : ''}` : ''}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--db-font-mono)',
          color: 'var(--db-red)',
          background: 'var(--db-red-dim)',
          borderRadius: 6,
          padding: '6px 10px',
        }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {empty && !loading && !error && (
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--db-font-mono)',
          color: 'var(--db-text-dim)',
          background: 'var(--db-surface2)',
          borderRadius: 6,
          padding: '10px 12px',
          lineHeight: 1.7,
        }}>
          No results for "{query}"
          <br />
          <span style={{ color: 'var(--db-amber)', fontSize: 10 }}>
            ⚠ KV store is empty — seed assets to activate search
          </span>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: 280,
          overflowY: 'auto',
        }}>
          {results.map((r) => (
            <div key={r.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 6,
              background: 'var(--db-surface2)',
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--db-surface3)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'var(--db-surface2)')
              }
            >
              {/* Thumbnail placeholder */}
              <div style={{
                width: 32, height: 32,
                borderRadius: 4,
                background: 'var(--db-surface3)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}>
                ◼
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  color: 'var(--db-text)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {r.title}
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--db-text-dim)',
                  fontFamily: 'var(--db-font-mono)',
                }}>
                  {r.category}
                </div>
              </div>

              {/* Status pill */}
              <span style={{
                fontSize: 9,
                fontFamily: 'var(--db-font-mono)',
                color: STATUS_COLORS[r.status] ?? 'var(--db-text-dim)',
                background: `${STATUS_COLORS[r.status] ?? 'var(--db-text-dim)'}18`,
                border: `1px solid ${STATUS_COLORS[r.status] ?? 'var(--db-text-dim)'}30`,
                borderRadius: 20,
                padding: '2px 8px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {r.status}
              </span>

              {/* Price */}
              {r.priceUsd != null && (
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--db-font-mono)',
                  color: 'var(--db-accent)',
                  flexShrink: 0,
                }}>
                  ${r.priceUsd}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Idle state */}
      {!query && (
        <div style={{
          fontSize: 11,
          color: 'var(--db-text-dim)',
          fontFamily: 'var(--db-font-mono)',
        }}>
          Type to search across all assets
        </div>
      )}

    </div>
  );
}
