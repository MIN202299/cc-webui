import type { Session, Message, Settings, McpServer, CreateSessionRequest, CreateMessageResponse } from '@cc-webui/contracts';

const BASE = '/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  // Sessions
  getSessions: () => req<Session[]>('/sessions'),
  createSession: (body: CreateSessionRequest) => req<Session>('/sessions', { method: 'POST', body: JSON.stringify(body) }),
  getSession: (id: string) => req<Session>(`/sessions/${id}`),
  deleteSession: (id: string) => req<{ ok: boolean }>(`/sessions/${id}`, { method: 'DELETE' }),
  updateSession: (id: string, body: { title?: string }) => req<Session>(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Messages
  getMessages: (sessionId: string) => req<Message[]>(`/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    req<CreateMessageResponse>(`/sessions/${sessionId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Runs
  cancelRun: (runId: string) => req<{ ok: boolean }>(`/runs/${runId}/cancel`, { method: 'POST' }),
  permissionDecision: (runId: string, decision: 'allow' | 'deny' | 'allow_always') =>
    req<{ ok: boolean }>(`/runs/${runId}/permission`, { method: 'POST', body: JSON.stringify({ decision }) }),

  // File system
  listDir: (path: string) => req<{ path: string; entries: unknown[] }>(`/fs?path=${encodeURIComponent(path)}`),
  readFile: (path: string) => req<{ path: string; content: string }>(`/fs/read?path=${encodeURIComponent(path)}`),

  // Settings
  getSettings: () => req<Settings>('/settings'),
  updateSettings: (body: Partial<Settings>) => req<Settings>('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // MCP
  getMcp: () => req<McpServer[]>('/mcp'),

  // Info
  getInfo: () => req<{ version: string; claudeAvailable: boolean; claudeVersion?: string }>('/info'),
};
