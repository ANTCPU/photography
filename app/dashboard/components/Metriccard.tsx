'use client';

export type MetricAccent = 'accent' | 'blue' | 'amber' | 'purple' | 'teal';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  accent: MetricAccent;
}

const ACCENT_VARS: Record<MetricAccent, { color: string; bar: string }> = {
  accent: { color: 'var(--db-accent)',  bar: 'var(--db-accent)'  },
  blue:   { color: 'var(--db-blue)',    bar: 'var(--db-blue)'    },
  amber:  { color: 'var(--db-amber)',   bar: 'var(--db-amber)'   },
  purple: { color: 'var(--db-purple)',  bar: 'var(--db-purple)'  },
  teal:   { color: 'var(--db-teal)',    bar: 'var(--db-teal)'    },
};

export default function MetricCard({ label, value, sub, subPositive, accent }: MetricCardProps) {
  const { color, bar } = ACCENT_VARS[accent];

  return (
    <div
      style={{
        background: 'var(--db-surface)',
        border: '1px solid var(--db-border)',
        borderRadius: 'var(--db-radius-lg)',
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Accent top line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, ${bar}, transparent)`,
        }}
      />

      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--db-text-dim)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: 'var(--db-font-mono)',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.5px',
          color,
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: 10,
            color: subPositive === true
              ? 'var(--db-teal)'
              : subPositive === false
              ? 'var(--db-red)'
              : 'var(--db-text-dim)',
            marginTop: 4,
            fontFamily: 'var(--db-font-mono)',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
