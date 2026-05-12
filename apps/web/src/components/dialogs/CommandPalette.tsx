import { useState, useEffect, useRef } from 'react';
import { SearchIcon, PlusIcon, GearIcon, MoonIcon, SunIcon } from '../atoms/icons.js';
import { useStore } from '../../store/index.js';
import { api } from '../../api/client.js';
import os from 'os';

interface Command { id: string; label: string; hint?: string; action: () => void; }

export function CommandPalette() {
  const { open, close, theme, toggleTheme, openSettings, loadSessions, setActiveSession } = useStore(s => ({
    open: s.paletteOpen,
    close: s.closePalette,
    theme: s.theme,
    toggleTheme: s.toggleTheme,
    openSettings: s.openSettings,
    loadSessions: s.loadSessions,
    setActiveSession: s.setActiveSession,
  }));

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? close() : useStore.getState().openPalette(); }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const commands: Command[] = [
    {
      id: 'new-session',
      label: 'New session',
      hint: '⌘N',
      action: async () => {
        const dir = prompt('Working directory:', '~') ?? '';
        if (dir) { await api.createSession({ cwd: dir }); await loadSessions(); }
        close();
      },
    },
    { id: 'toggle-theme', label: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, action: () => { toggleTheme(); close(); } },
    { id: 'settings', label: 'Open settings', action: () => { openSettings(); close(); } },
  ];

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(31,30,27,.42)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'start center', zIndex: 200, paddingTop: '15vh' }}
      onClick={close}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, boxShadow: 'var(--shadow-3)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <SearchIcon size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)' }}
          />
          <span className="kbd" style={{ fontSize: 11 }}>Esc</span>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={c.action} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              cursor: 'pointer', fontSize: 14, color: 'var(--ink)',
              borderBottom: '1px solid var(--line)',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.hint && <span className="kbd">{c.hint}</span>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', color: 'var(--muted)', fontSize: 13 }}>No commands match "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
