import { useState } from 'react';
import { Pill } from '../atoms/Pill.js';
import { FileIcon, PlusIcon, DiffIcon, SearchIcon, TerminalIcon, CubeIcon, ChevDownIcon } from '../atoms/icons.js';
import type { PersistedEvent } from '@cc-webui/contracts';

type Tone = 'blue' | 'green' | 'amber' | 'neutral';

interface ToolMeta { icon: React.ComponentType<{ size?: number }>; tone: Tone; label: string; }

const META: Record<string, ToolMeta> = {
  Read:  { icon: FileIcon,     tone: 'blue',    label: 'Read' },
  Write: { icon: PlusIcon,     tone: 'green',   label: 'Write' },
  Edit:  { icon: DiffIcon,     tone: 'amber',   label: 'Edit' },
  Grep:  { icon: SearchIcon,   tone: 'neutral', label: 'Grep' },
  Bash:  { icon: TerminalIcon, tone: 'neutral', label: 'Bash' },
  Glob:  { icon: SearchIcon,   tone: 'neutral', label: 'Glob' },
  LS:    { icon: FileIcon,     tone: 'neutral', label: 'LS' },
  Find:  { icon: SearchIcon,   tone: 'neutral', label: 'Find' },
};

interface Props {
  tool: string;
  input: Record<string, unknown>;
  result?: Extract<PersistedEvent, { kind: 'tool_result' }>;
  awaiting?: boolean;
  defaultExpanded?: boolean;
}

export function ToolCard({ tool, input, result, awaiting, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded || awaiting);
  const m = META[tool] ?? { icon: CubeIcon, tone: 'neutral' as Tone, label: tool };
  const Glyph = m.icon;

  // Derive a readable target from input
  const target = (input.file_path ?? input.path ?? input.command ?? input.pattern ?? '') as string;
  const summary = result
    ? (result.isError ? 'error' : `${result.content.length} chars`)
    : awaiting
    ? 'running…'
    : '';

  return (
    <div style={{
      border: '1px solid var(--line)', borderRadius: 10,
      background: 'var(--surface)', overflow: 'hidden', boxShadow: 'var(--shadow-1)',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          borderBottom: expanded ? '1px solid var(--line)' : 'none',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 5, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: `var(--${m.tone}-tint, var(--surface-sunken))`,
          color: `var(--${m.tone}, var(--ink-2))`,
        }}>
          <Glyph size={13} />
        </div>

        <span className="t-mono" style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1, minWidth: 0 }}>
          <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{m.label}</b>
          {target && <><span style={{ color: 'var(--muted)' }}>  ·  </span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{target}</span></>}
        </span>

        {awaiting && <Pill tone="amber" dot sm>Approval</Pill>}
        {summary && !awaiting && <span style={{ fontSize: 11.5, color: 'var(--muted)', flexShrink: 0 }}>{summary}</span>}
        <ChevDownIcon size={14} style={{ color: 'var(--muted)', flexShrink: 0, transform: expanded ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }} />
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ background: 'var(--surface-sunken)' }}>
          {/* Input preview */}
          {(input.content ?? input.command ?? input.pattern ?? input.old_string) && (
            <pre style={{
              margin: 0, padding: '10px 14px',
              fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.55,
              color: 'var(--ink-2)', maxHeight: 200, overflow: 'auto',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderBottom: '1px solid var(--line)',
            }}>
              {String(input.content ?? input.command ?? input.pattern ?? `${input.old_string ?? ''}\n→ ${input.new_string ?? ''}`).slice(0, 2000)}
            </pre>
          )}

          {/* Result */}
          {result && (
            <pre style={{
              margin: 0, padding: '10px 14px',
              fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.55,
              color: result.isError ? 'var(--rose)' : 'var(--ink-2)',
              maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {result.content.slice(0, 2000)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
