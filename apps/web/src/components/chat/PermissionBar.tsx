import { ShieldIcon } from '../atoms/icons.js';
import { api } from '../../api/client.js';
import type { PersistedEvent } from '@cc-webui/contracts';

interface Props {
  runId: string;
  lastTool: PersistedEvent;
}

export function PermissionBar({ runId, lastTool }: Props) {
  if (lastTool.kind !== 'tool_use') return null;

  const input = lastTool.input as Record<string, unknown>;
  const target = String(input.file_path ?? input.path ?? input.command ?? lastTool.name);

  async function decide(decision: 'allow' | 'deny' | 'allow_always') {
    await api.permissionDecision(runId, decision);
  }

  return (
    <div style={{
      marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--amber-tint)', border: '1px solid var(--amber)',
    }}>
      <ShieldIcon size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>
        Claude needs approval to run{' '}
        <span className="t-mono" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{lastTool.name}</span>
        {target && target !== lastTool.name && (
          <> on <span className="t-mono" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{target}</span></>
        )}
      </span>
      <button className="btn sm" onClick={() => decide('deny')}>Deny</button>
      <button className="btn sm" onClick={() => decide('allow')}>Allow once</button>
      <button className="btn accent sm" onClick={() => decide('allow_always')}>Allow always</button>
    </div>
  );
}
