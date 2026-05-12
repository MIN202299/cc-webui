import { Avatar } from '../atoms/Avatar.js';
import { Pill } from '../atoms/Pill.js';
import { FolderOpenIcon, BranchIcon, FireIcon, BellIcon, MoonIcon, SunIcon, GearIcon } from '../atoms/icons.js';
import { useStore } from '../../store/index.js';

export function TopBar() {
  const { theme, toggleTheme, activeSession, openSettings } = useStore(s => ({
    theme: s.theme,
    toggleTheme: s.toggleTheme,
    activeSession: s.sessions.find(s2 => s2.id === s.activeSessionId),
    openSettings: s.openSettings,
  }));

  const totalCost = useStore(s => {
    const msgs = s.activeSessionId ? (s.messages[s.activeSessionId] ?? []) : [];
    return msgs.reduce((sum, m) => {
      const usage = m.events.find(e => e.kind === 'usage');
      return sum + (usage?.kind === 'usage' ? usage.costUsd : 0);
    }, 0);
  });

  return (
    <header style={{
      height: 42, display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px 0 16px', borderBottom: '1px solid var(--line)',
      background: 'var(--surface)', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size={20} />
        <span className="t-serif" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          Claude Code
        </span>
      </div>

      <span style={{ width: 1, height: 18, background: 'var(--line)' }} />

      {activeSession && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderOpenIcon size={13} style={{ color: 'var(--muted)' }} />
            <span className="t-mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              {activeSession.cwd.replace(/^\/Users\/[^/]+|^\/home\/[^/]+/, '~')}
            </span>
          </div>
          <Pill tone="ghost" sm>
            <BranchIcon size={11} />
            main
          </Pill>
        </>
      )}

      <div style={{ flex: 1 }} />

      {activeSession && (
        <Pill tone="neutral" sm mono>
          <span style={{ color: 'var(--muted)' }}>{activeSession.model}</span>
        </Pill>
      )}

      {totalCost > 0 && (
        <Pill tone="neutral" sm>
          <FireIcon size={11} style={{ color: 'var(--rust)' }} />
          ${totalCost.toFixed(3)}
        </Pill>
      )}

      <button className="btn ghost sm" aria-label="Notifications">
        <BellIcon size={14} />
      </button>
      <button className="btn ghost sm" aria-label="Toggle theme" onClick={toggleTheme}>
        {theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />}
      </button>
      <button className="btn ghost sm" aria-label="Settings" onClick={openSettings}>
        <GearIcon size={14} />
      </button>
    </header>
  );
}
