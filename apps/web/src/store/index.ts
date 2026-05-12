import { create } from 'zustand';
import { api } from '../api/client.js';
import type { Session, Message, PersistedEvent } from '@cc-webui/contracts';

type InspectorTab = 'files' | 'diff' | 'terminal' | 'todos';
type Theme = 'light' | 'dark';

interface PendingPermission { runId: string; tool: string; input: unknown; }

interface Store {
  // Sessions
  sessions: Session[];
  activeSessionId: string | null;
  loadSessions: () => Promise<void>;
  setActiveSession: (id: string) => void;
  createSession: (cwd: string) => Promise<void>;

  // Messages
  messages: Record<string, Message[]>;
  loadMessages: (sessionId: string) => Promise<void>;
  addOptimisticMessage: (sessionId: string, content: string) => void;
  appendEventToLastAssistant: (sessionId: string, event: PersistedEvent) => void;
  updateLastAssistantStatus: (sessionId: string, status: string) => void;

  // Inspector
  inspectorTab: InspectorTab;
  setInspectorTab: (tab: InspectorTab) => void;
  inspectorVisible: boolean;
  hideInspector: () => void;
  showInspector: () => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Dialogs
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;

  // Permission
  pendingPermission: PendingPermission | null;
  setPendingPermission: (p: PendingPermission | null) => void;
  clearPermission: () => void;
}

export const useStore = create<Store>((set, get) => ({
  // ── Sessions ──────────────────────────────────────────────────────────────
  sessions: [],
  activeSessionId: null,

  loadSessions: async () => {
    const sessions = await api.getSessions();
    set(s => {
      const active = s.activeSessionId ?? sessions[0]?.id ?? null;
      return { sessions, activeSessionId: active };
    });
    const active = get().activeSessionId;
    if (active) get().loadMessages(active);
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id });
    get().loadMessages(id);
  },

  createSession: async (cwd) => {
    const session = await api.createSession({ cwd });
    set(s => ({ sessions: [session, ...s.sessions], activeSessionId: session.id }));
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {},

  loadMessages: async (sessionId) => {
    const msgs = await api.getMessages(sessionId);
    set(s => ({ messages: { ...s.messages, [sessionId]: msgs } }));
  },

  addOptimisticMessage: (sessionId, content) => {
    const now = Date.now();
    const userMsg: Message = {
      id: `opt-user-${now}`,
      sessionId, role: 'user', content,
      runId: null, runStatus: null, events: [],
      startedAt: now, endedAt: null, createdAt: now,
    };
    const asstMsg: Message = {
      id: `opt-asst-${now}`,
      sessionId, role: 'assistant', content: null,
      runId: null, runStatus: 'queued', events: [],
      startedAt: now, endedAt: null, createdAt: now + 1,
    };
    set(s => ({
      messages: { ...s.messages, [sessionId]: [...(s.messages[sessionId] ?? []), userMsg, asstMsg] },
    }));
  },

  appendEventToLastAssistant: (sessionId, event) => {
    set(s => {
      const msgs = [...(s.messages[sessionId] ?? [])];
      const idx = msgs.findLastIndex(m => m.role === 'assistant');
      if (idx < 0) return {};
      const msg = { ...msgs[idx], events: [...msgs[idx].events, event] };
      msgs[idx] = msg;
      return { messages: { ...s.messages, [sessionId]: msgs } };
    });
  },

  updateLastAssistantStatus: (sessionId, status) => {
    set(s => {
      const msgs = [...(s.messages[sessionId] ?? [])];
      const idx = msgs.findLastIndex(m => m.role === 'assistant');
      if (idx < 0) return {};
      msgs[idx] = { ...msgs[idx], runStatus: status as Message['runStatus'] };
      return { messages: { ...s.messages, [sessionId]: msgs } };
    });
  },

  // ── Inspector ─────────────────────────────────────────────────────────────
  inspectorTab: 'diff',
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  inspectorVisible: true,
  hideInspector: () => set({ inspectorVisible: false }),
  showInspector: () => set({ inspectorVisible: true }),

  // ── Theme ─────────────────────────────────────────────────────────────────
  theme: (localStorage.getItem('theme') ?? 'light') as Theme,
  toggleTheme: () => set(s => {
    const next = s.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  // ── Dialogs ───────────────────────────────────────────────────────────────
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  paletteOpen: false,
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),

  // ── Permission ────────────────────────────────────────────────────────────
  pendingPermission: null,
  setPendingPermission: (p) => set({ pendingPermission: p }),
  clearPermission: () => set({ pendingPermission: null }),
}));
