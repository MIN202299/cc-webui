// SSE event types streamed from daemon → web client

export interface TodoItem {
  id: number;
  text: string;
  state: 'done' | 'doing' | 'todo';
}

export type AgentPayload =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; toolUseId: string; content: string; isError: boolean }
  | { type: 'permission_request'; id: string; tool: string; input: unknown }
  | { type: 'todo_update'; todos: TodoItem[] }
  | { type: 'usage'; inputTokens: number; outputTokens: number; costUsd: number; durationMs: number }
  | { type: 'status'; label: string; detail?: string };

export interface SseStartPayload {
  runId: string;
  sessionId: string;
  messageId: string;
  model: string;
}

export interface SseEndPayload {
  status: 'succeeded' | 'failed' | 'canceled';
  exitCode: number | null;
  durationMs: number;
  costUsd?: number;
}

export type RunSseEvent =
  | { event: 'start'; data: SseStartPayload }
  | { event: 'agent'; data: AgentPayload }
  | { event: 'end'; data: SseEndPayload }
  | { event: 'error'; data: { message: string } };
