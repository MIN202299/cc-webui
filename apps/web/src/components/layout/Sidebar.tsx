import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Avatar } from '../atoms/Avatar.js';
import { Pill } from '../atoms/Pill.js';
import { PlusIcon, SearchIcon, GearIcon, ChevUDIcon, FolderOpenIcon } from '../atoms/icons.js';
import { useStore } from '../../store/index.js';
import { api } from '../../api/client.js';
import { DirectoryPickerDialog } from '../dialogs/DirectoryPickerDialog.js';
import type { Session } from '@cc-webui/contracts';

export function Sidebar() {
  const { sessions, activeSessionId, setActiveSession, loadSessions, openSettings } = useStore(useShallow(s => ({
    sessions: s.sessions,
    activeSessionId: s.activeSessionId,
    setActiveSession: s.setActiveSession,
    loadSessions: s.loadSessions,
    openSettings: s.openSettings,
  })));

  const [showDirPicker, setShowDirPicker] = useState(false);

  function handleNewSession() {
    setShowDirPicker(true);
  }

  async function handleDirConfirm(dir: string) {
    setShowDirPicker(false);
    await api.createSession({ cwd: dir === '~' ? (import.meta.env.VITE_DEFAULT_CWD ?? '/') : dir });
    await loadSessions();
  }

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'var(--surface-sunken)', borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      {/* Project indicator */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
        <div className="t-label" style={{ marginBottom: 6, fontSize: 10.5 }}>Project</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', background: 'var(--surface)', borderRadius: 6,
          border: '1px solid var(--line)', cursor: 'default',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 5,
            background: 'linear-gradient(135deg, #C96442, #8C3F2E)',
            display: 'grid', placeItems: 'center', color: '#fff',
            fontFamily: 'var(--serif)', fontSize: 13, flexShrink: 0,
          }}>
            {sessions[0]?.cwd.split('/').pop()?.[0]?.toUpperCase() ?? 'L'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sessions[0]?.cwd.split('/').pop() ?? 'local'}
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sessions[0]?.cwd ?? '—'}
            </div>
          </div>
          <ChevUDIcon size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 12px 6px' }}>
        <button className="btn" style={{ width: '100%', justifyContent: 'space-between', background: 'var(--surface)' }} onClick={handleNewSession}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusIcon size={14} /> New session
          </span>
          <span style={{ display: 'flex', gap: 3 }}>
            <span className="kbd">⌘</span><span className="kbd">N</span>
          </span>
        </button>
      </div>

      <div style={{ padding: '0 12px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6,
        }}>
          <SearchIcon size={13} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Search sessions</span>
          <div style={{ flex: 1 }} />
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {/* Sessions list */}
      <div style={{ padding: '4px 8px 12px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <div className="t-label" style={{ padding: '8px 6px 4px' }}>Recent</div>
        {sessions.map(s => (
          <SessionRow key={s.id} session={s} active={s.id === activeSessionId} onClick={() => setActiveSession(s.id)} />
        ))}
        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            No sessions yet.<br />Click "New session" to start.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar kind="user" size={26} initial="U" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Local</div>
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>claude CLI</div>
        </div>
        <button className="btn ghost sm" onClick={openSettings}><GearIcon size={13} /></button>
      </div>

      {showDirPicker && (
        <DirectoryPickerDialog
          onConfirm={handleDirConfirm}
          onCancel={() => setShowDirPicker(false)}
        />
      )}
    </aside>
  );
}

function SessionRow({ session, active, onClick }: { session: Session; active: boolean; onClick: () => void }) {
  const status = useStore(s => {
    const msgs = s.messages[session.id] ?? [];
    const last = msgs[msgs.length - 1];
    if (last?.runStatus === 'running') return 'running';
    if (last?.runStatus === 'queued') return 'running';
    return 'done';
  });

  const dotBg = status === 'running' ? 'var(--rust)' : 'var(--line-2)';
  const msgs = useStore(s => (s.messages[session.id] ?? []).length);

  return (
    <div onClick={onClick} style={{
      padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
      background: active ? 'var(--surface-sunken)' : 'transparent',
      border: `1px solid ${active ? 'var(--line)' : 'transparent'}`,
      marginBottom: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: dotBg, flexShrink: 0,
          boxShadow: status === 'running' ? '0 0 0 3px var(--rust-tint)' : 'none',
        }} />
        <div style={{ flex: 1, fontSize: 13, fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.title ?? 'New session'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingLeft: 14, fontSize: 11.5, color: 'var(--muted)' }}>
        <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
        <span>·</span>
        <span>{msgs} msgs</span>
      </div>
    </div>
  );
}
