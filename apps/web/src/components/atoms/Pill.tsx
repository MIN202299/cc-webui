import type { ReactNode, CSSProperties } from 'react';

type Tone = 'neutral' | 'rust' | 'green' | 'amber' | 'rose' | 'blue' | 'ghost';

const toneMap: Record<Tone, { bg: string; bd: string; fg: string }> = {
  neutral: { bg: 'var(--surface-2)',   bd: 'var(--line)',        fg: 'var(--ink-2)' },
  rust:    { bg: 'var(--rust-tint)',   bd: 'transparent',        fg: 'var(--rust)'  },
  green:   { bg: 'var(--green-tint)',  bd: 'transparent',        fg: 'var(--green)' },
  amber:   { bg: 'var(--amber-tint)', bd: 'transparent',        fg: 'var(--amber)' },
  rose:    { bg: 'var(--rose-tint)',   bd: 'transparent',        fg: 'var(--rose)'  },
  blue:    { bg: 'var(--blue-tint)',   bd: 'transparent',        fg: 'var(--blue)'  },
  ghost:   { bg: 'transparent',        bd: 'var(--line)',        fg: 'var(--muted)' },
};

interface PillProps {
  tone?: Tone;
  children?: ReactNode;
  dot?: boolean;
  mono?: boolean;
  sm?: boolean;
  style?: CSSProperties;
}

export function Pill({ tone = 'neutral', children, dot, mono, sm, style }: PillProps) {
  const s = toneMap[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: sm ? 18 : 22,
      padding: `0 ${sm ? 6 : 8}px`,
      borderRadius: 999,
      background: s.bg, border: `1px solid ${s.bd}`, color: s.fg,
      fontSize: sm ? 10.5 : 11.5,
      fontFamily: mono ? 'var(--mono)' : 'var(--sans)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg, flexShrink: 0 }} />}
      {children}
    </span>
  );
}
