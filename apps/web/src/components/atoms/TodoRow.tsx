import { CheckIcon } from './icons.js';

export interface TodoItem { id: number; text: string; state: 'done' | 'doing' | 'todo'; }

export function TodoRow({ t }: { t: TodoItem }) {
  const isDone = t.state === 'done';
  const isDoing = t.state === 'doing';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 4px' }}>
      <div style={{
        marginTop: 2, width: 14, height: 14, borderRadius: 3, flexShrink: 0,
        border: `1.4px solid ${isDone ? 'var(--green)' : isDoing ? 'var(--rust)' : 'var(--line-2)'}`,
        background: isDone ? 'var(--green)' : 'transparent',
        display: 'grid', placeItems: 'center',
      }}>
        {isDone && <CheckIcon size={9} stroke={2.5} style={{ color: '#fff' }} />}
        {isDoing && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--rust)' }} />}
      </div>
      <span style={{
        fontSize: 12.5,
        color: isDone ? 'var(--muted)' : 'var(--ink-2)',
        textDecoration: isDone ? 'line-through' : 'none',
        fontWeight: isDoing ? 500 : 400,
        lineHeight: 1.4,
      }}>
        {t.text}
      </span>
    </div>
  );
}
