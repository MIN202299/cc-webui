import { useEffect } from 'react';
import { TopBar } from './components/layout/TopBar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { ChatMain } from './components/layout/ChatMain.js';
import { Inspector } from './components/layout/Inspector.js';
import { PermissionDialog } from './components/dialogs/PermissionDialog.js';
import { SettingsPanel } from './components/dialogs/SettingsPanel.js';
import { CommandPalette } from './components/dialogs/CommandPalette.js';
import { useStore } from './store/index.js';

export function App() {
  const { loadSessions, theme, inspectorVisible, openPalette } = useStore(s => ({
    loadSessions: s.loadSessions,
    theme: s.theme,
    inspectorVisible: s.inspectorVisible,
    openPalette: s.openPalette,
  }));

  // Bootstrap
  useEffect(() => {
    // Apply persisted theme
    document.documentElement.setAttribute('data-theme', theme);
    loadSessions();
  }, []);

  // Global keybindings
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openPalette(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette]);

  return (
    <div data-theme={theme} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar />
        <ChatMain />
        {inspectorVisible && <Inspector />}
      </div>

      {/* Overlays */}
      <PermissionDialog />
      <SettingsPanel />
      <CommandPalette />
    </div>
  );
}
