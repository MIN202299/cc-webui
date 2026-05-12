import { useShallow } from 'zustand/react/shallow';
import { FolderIcon, DiffIcon, TerminalIcon, TodoIcon, PanelRightIcon } from '../atoms/icons.js';
import { Pill } from '../atoms/Pill.js';
import { FileTreeNode } from '../atoms/FileTreeNode.js';
import { TodoRow } from '../atoms/TodoRow.js';
import { useStore } from '../../store/index.js';
import type { PersistedEvent } from '@cc-webui/contracts';

type Tab = 'files' | 'diff' | 'terminal' | 'todos';

const TABS: { id: Tab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'files',    icon: FolderIcon,   label: 'Files' },
  { id: 'diff',     icon: DiffIcon,     label: 'Diff' },
  { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
  { id: 'todos',    icon: TodoIcon,     label: 'Plan' },
];

export function Inspector() {
  const { tab, setTab, hideInspector } = useStore(useShallow(s => ({
    tab: s.inspectorTab,
    setTab: s.setInspectorTab,
    hideInspector: s.hideInspector,
  })));

  const events = useStore(useShallow(s => {
    const sid = s.activeSessionId;
    if (!sid) return [] as PersistedEvent[];
    const msgs = s.messages[sid] ?? [];
    return msgs.flatMap(m => m.events);
  }));

  return (
    <aside style={{
      width: 380, flexShrink: 0,
      background: 'var(--surface)', borderLeft: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 30, padding: '0 10px', borderRadius: 6,
            background: tab === t.id ? 'var(--surface)' : 'transparent',
            border: `1px solid ${tab === t.id ? 'var(--line)' : 'transparent'}`,
            color: tab === t.id ? 'var(--ink)' : 'var(--ink-2)',
            fontSize: 12.5, cursor: 'pointer', fontWeight: tab === t.id ? 500 : 400,
          }}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn ghost sm" onClick={hideInspector}><PanelRightIcon size={13} /></button>
      </div>

      <div style={{ padding: 14, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'files'    && <FilesTab events={events} />}
        {tab === 'diff'     && <DiffTab events={events} />}
        {tab === 'terminal' && <TerminalTab events={events} />}
        {tab === 'todos'    && <PlanTab events={events} />}
      </div>
    </aside>
  );
}

// ── Files tab ─────────────────────────────────────────────────────────────────
function FilesTab({ events }: { events: PersistedEvent[] }) {
  const writes = events.filter(e => e.kind === 'tool_use' && (e.name === 'Write' || e.name === 'Edit')) as Extract<PersistedEvent, { kind: 'tool_use' }>[];
  const cwd = useStore(s => s.sessions.find(sess => sess.id === s.activeSessionId)?.cwd ?? '');

  const nodes = writes.map(w => {
    const input = w.input as { file_path?: string; path?: string };
    return {
      name: (input.file_path ?? input.path ?? '').split('/').pop() ?? '',
      path: input.file_path ?? input.path ?? '',
      type: 'file' as const,
      modified: w.name === 'Edit',
      added: w.name === 'Write',
    };
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {nodes.length === 0
        ? <div style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 4px' }}>No file changes yet.</div>
        : nodes.map((n, i) => <FileTreeNode key={i} node={n} />)
      }
    </div>
  );
}

// ── Diff tab ──────────────────────────────────────────────────────────────────
function DiffTab({ events }: { events: PersistedEvent[] }) {
  const edits = events.filter(e => e.kind === 'tool_use' && e.name === 'Edit') as Extract<PersistedEvent, { kind: 'tool_use' }>[];
  const last = edits[edits.length - 1];

  if (!last) return <div style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 4px' }}>No edits yet.</div>;

  const input = last.input as { file_path?: string; old_string?: string; new_string?: string };
  const oldLines = (input.old_string ?? '').split('\n');
  const newLines = (input.new_string ?? '').split('\n');

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="t-mono" style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{input.file_path ?? '—'}</span>
        <Pill tone="green" sm mono>+{newLines.length}</Pill>
        <Pill tone="rose" sm mono>−{oldLines.length}</Pill>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-sunken)' }}>
        {oldLines.map((line, i) => <DiffLine key={`d${i}`} type="del" line={i + 1} text={line} />)}
        {newLines.map((line, i) => <DiffLine key={`a${i}`} type="add" line={i + 1} text={line} />)}
      </div>
    </div>
  );
}

function DiffLine({ type, line, text }: { type: 'add' | 'del' | 'ctx'; line: number; text: string }) {
  const bg = type === 'add' ? 'rgba(92,124,79,.10)' : type === 'del' ? 'rgba(168,73,58,.10)' : 'transparent';
  const fg = type === 'add' ? 'var(--green)' : type === 'del' ? 'var(--rose)' : 'var(--ink-2)';
  const mark = type === 'add' ? '+' : type === 'del' ? '−' : ' ';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 14px 1fr', background: bg, fontFamily: 'var(--mono)', fontSize: 11.5 }}>
      <span style={{ textAlign: 'right', paddingRight: 6, color: 'var(--muted)' }}>{line}</span>
      <span style={{ color: fg, textAlign: 'center' }}>{mark}</span>
      <code style={{ padding: '1px 8px 1px 0', color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{text || ' '}</code>
    </div>
  );
}

// ── Terminal tab ──────────────────────────────────────────────────────────────
function TerminalTab({ events }: { events: PersistedEvent[] }) {
  const bashResults = events.filter(e => e.kind === 'tool_result') as Extract<PersistedEvent, { kind: 'tool_result' }>[];

  return (
    <div style={{
      flex: 1, minHeight: 0, overflow: 'auto', borderRadius: 8,
      border: '1px solid var(--line)', background: 'var(--surface-sunken)',
      padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)',
    }}>
      {bashResults.length === 0
        ? <span style={{ color: 'var(--muted)' }}>No bash output yet.</span>
        : bashResults.map((r, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 6 }}>
              <span style={{ color: 'var(--rust)' }}>$</span>
              <span style={{ color: 'var(--muted)' }}>tool result {i + 1}</span>
            </div>
            <pre style={{ margin: '4px 0 0 20px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: r.isError ? 'var(--rose)' : 'var(--ink-2)' }}>
              {r.content}
            </pre>
          </div>
        ))}
      <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 6, marginTop: 4 }}>
        <span style={{ color: 'var(--rust)' }}>$</span>
        <span style={{ display: 'inline-block', width: 7, height: 14, verticalAlign: '-3px', background: 'var(--rust)', opacity: 0.8 }} />
      </div>
    </div>
  );
}

// ── Plan tab ──────────────────────────────────────────────────────────────────
function PlanTab({ events }: { events: PersistedEvent[] }) {
  const usage = events.filter(e => e.kind === 'usage').pop() as Extract<PersistedEvent, { kind: 'usage' }> | undefined;
  const tokenBudget = useStore(s => s.sessions.find(sess => sess.id === s.activeSessionId)?.tokenBudget ?? 200000);
  const used = (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);
  const pct = Math.min(100, (used / tokenBudget) * 100);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <div className="divider" style={{ margin: '0 0 14px' }} />
      <div className="t-label" style={{ marginBottom: 6 }}>Token usage</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span className="t-display" style={{ fontSize: 24 }}>{used.toLocaleString()}</span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>/ {tokenBudget.toLocaleString()} tokens</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'var(--surface-sunken)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--rust-soft), var(--rust))' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)' }}>
        <span>input {(usage?.inputTokens ?? 0).toLocaleString()} · output {(usage?.outputTokens ?? 0).toLocaleString()}</span>
        <span>${(usage?.costUsd ?? 0).toFixed(4)}</span>
      </div>
    </div>
  );
}
