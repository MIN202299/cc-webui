import { useShallow } from 'zustand/react/shallow';
import { ShieldIcon, XIcon } from '../atoms/icons.js';
import { api } from '../../api/client.js';
import { useStore } from '../../store/index.js';

export function PermissionDialog() {
  const { permission, clearPermission } = useStore(useShallow(s => ({
    permission: s.pendingPermission,
    clearPermission: s.clearPermission,
  })));

  if (!permission) return null;

  async function decide(d: 'allow' | 'deny' | 'allow_always') {
    await api.permissionDecision(permission!.runId, d);
    clearPermission();
  }

  const input = permission.input as Record<string, unknown>;
  const cmd = String(input.command ?? input.file_path ?? input.path ?? permission.tool);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(31,30,27,.42)', backdropFilter: 'blur(2px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 24,
    }}>
      <div style={{
        width: 520, background: 'var(--surface)',
        border: '1px solid var(--line)', borderRadius: 14,
        boxShadow: 'var(--shadow-3)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--amber-tint)', color: 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <ShieldIcon size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="t-h1" style={{ margin: '0 0 4px', fontSize: 18 }}>
              Allow {permission.tool}?
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 13.5 }}>
              Claude wants to run this {permission.tool === 'Bash' ? 'command' : 'operation'}.
            </p>
          </div>
          <button className="btn ghost sm" onClick={() => decide('deny')}><XIcon size={14} /></button>
        </div>

        {/* Command preview */}
        <div style={{ padding: '0 22px 18px' }}>
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'var(--surface-sunken)', border: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ color: 'var(--rust)', flexShrink: 0 }}>$</span>
            <span style={{ wordBreak: 'break-all' }}>{cmd}</span>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: 12.5, color: 'var(--ink-2)' }}>
            <span style={{ color: 'var(--muted)' }}>Tool</span>
            <span className="t-mono" style={{ color: 'var(--rust)' }}>{permission.tool}</span>
            {input.file_path && <><span style={{ color: 'var(--muted)' }}>File</span><span className="t-mono">{String(input.file_path)}</span></>}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '14px 22px', background: 'var(--surface-sunken)',
          borderTop: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ flex: 1 }} />
          <button className="btn sm" onClick={() => decide('deny')}>Deny</button>
          <button className="btn sm" onClick={() => decide('allow')}>Allow once</button>
          <button className="btn accent sm" onClick={() => decide('allow_always')}>Allow always</button>
        </div>
      </div>
    </div>
  );
}
