export type PermissionMode = 'bypass_all' | 'auto_reads' | 'manual';
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

// ── Sessions ──────────────────────────────────────────────────────────────────
export interface Session {
  id: string;
  cwd: string;
  title: string | null;
  model: string;
  claudeSessionId: string | null;
  permissionMode: PermissionMode;
  allowedTools: string[];
  tokenBudget: number;
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
  lastMessageAt?: number;
}

export interface CreateSessionRequest {
  cwd: string;
  title?: string;
  model?: string;
  permissionMode?: PermissionMode;
}

// ── Messages ──────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string | null;
  runId: string | null;
  runStatus: RunStatus | null;
  events: PersistedEvent[];
  startedAt: number | null;
  endedAt: number | null;
  createdAt: number;
}

export interface CreateMessageRequest {
  content: string;
}

export interface CreateMessageResponse {
  runId: string;
  messageId: string;       // assistant message id
  userMessageId: string;
}

// ── Persisted events (stored in DB) ──────────────────────────────────────────
export type PersistedEvent =
  | { kind: 'text'; text: string }
  | { kind: 'tool_use'; id: string; name: string; input: unknown }
  | { kind: 'tool_result'; toolUseId: string; content: string; isError: boolean }
  | { kind: 'usage'; inputTokens: number; outputTokens: number; costUsd: number; durationMs: number }
  | { kind: 'status'; label: string };

// ── Runs ──────────────────────────────────────────────────────────────────────
export interface RunStatusResponse {
  id: string;
  sessionId: string;
  messageId: string;
  status: RunStatus;
  createdAt: number;
  updatedAt: number;
}

export interface PermissionDecisionRequest {
  decision: 'allow' | 'deny' | 'allow_always';
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface Settings {
  defaultModel: string;
  defaultCwd: string;
  permissionMode: PermissionMode;
  tokenBudget: number;
  autoApproveReads: boolean;
  autoApproveGreps: boolean;
  autoApproveWrites: boolean;
  autoApproveBash: boolean;
}

// ── MCP ───────────────────────────────────────────────────────────────────────
export interface McpServer {
  name: string;
  state: 'connected' | 'error' | 'idle';
  tools: number;
  latency: string;
  pkg?: string;
}

// ── File system ───────────────────────────────────────────────────────────────
export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileEntry[];
  modified?: boolean;
  added?: boolean;
}

// ── Info ──────────────────────────────────────────────────────────────────────
export interface DaemonInfo {
  version: string;
  models: string[];
  claudeAvailable: boolean;
  claudeVersion?: string;
}
