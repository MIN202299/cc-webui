interface AvatarProps { kind?: 'claude' | 'user'; size?: number; initial?: string; }

export function Avatar({ kind = 'claude', size = 26, initial = 'Y' }: AvatarProps) {
  if (kind === 'user') {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--surface-sunken)', border: '1px solid var(--line)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--serif)', fontSize: size * 0.46, color: 'var(--ink-2)',
        flexShrink: 0,
      }}>
        {initial}
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.22),
      background: 'linear-gradient(180deg, #D97757, #B95436)',
      display: 'grid', placeItems: 'center', color: '#FBF8F1',
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.2)',
      flexShrink: 0,
    }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none">
        <path d="M5 18 12 4l7 14M8 14h8" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
