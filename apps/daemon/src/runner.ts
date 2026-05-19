/**
 * Orchestrates a Claude run: spawns the CLI, streams events via SSE,
 * persists results to SQLite, and manages the run lifecycle.
 */
import { db } from './db.js';
import { spawnClaude, type ClaudeRunOptions } from './claude.js';
import { emit, finish, type Run } from './runs.js';
import type { PermissionMode } from '@cc-webui/contracts';

interface SessionRow {
  id: string;
  cwd: string;
  model: string;
  claude_session_id: string | null;
  permission_mode: PermissionMode;
  allowed_tools: string;
}

export async function startRun(session: SessionRow, prompt: string, run: Run): Promise<void> {
  run.status = 'running';
  db.prepare(`UPDATE messages SET run_status = 'running' WHERE id = ?`).run(run.messageId);

  console.log(`[stream] run=${run.id} started at ${Date.now()}`);
  emit(run, 'start', {
    runId: run.id,
    sessionId: run.sessionId,
    messageId: run.messageId,
    model: run.model,
  });

  const opts: ClaudeRunOptions = {
    cwd: session.cwd,
    prompt,
    model: session.model,
    claudeSessionId: session.claude_session_id ?? undefined,
    permissionMode: session.permission_mode,
    allowedTools: resolveAllowedTools(session),
  };

  const { child, events } = spawnClaude(opts);
  run.child = child;

  const persisted: unknown[] = [];
  let newClaudeSessionId: string | null = null;
  let totalCost = 0;
  let finalExitCode: number | null = null;

  try {
    for await (const ev of events) {
      if (run.cancelRequested) { child.kill('SIGTERM'); break; }

      switch (ev.type) {
        case 'init':
          newClaudeSessionId = ev.claudeSessionId;
          break;

        case 'text':
          console.log(`[stream] text chunk at ${Date.now()} len=${ev.text.length} preview=${JSON.stringify(ev.text.slice(0, 40))}`);
          emit(run, 'agent', { type: 'text_delta', delta: ev.text });
          persisted.push({ kind: 'text', text: ev.text });
          break;

        case 'tool_use':
          emit(run, 'agent', { type: 'tool_use', id: ev.id, name: ev.name, input: ev.input });
          persisted.push({ kind: 'tool_use', id: ev.id, name: ev.name, input: ev.input });
          break;

        case 'tool_result':
          emit(run, 'agent', { type: 'tool_result', toolUseId: ev.toolUseId, content: ev.content, isError: ev.isError });
          persisted.push({ kind: 'tool_result', toolUseId: ev.toolUseId, content: ev.content, isError: ev.isError });
          break;

        case 'usage':
          totalCost = ev.costUsd;
          emit(run, 'agent', { type: 'usage', inputTokens: ev.inputTokens, outputTokens: ev.outputTokens, costUsd: ev.costUsd, durationMs: ev.durationMs });
          persisted.push({ kind: 'usage', inputTokens: ev.inputTokens, outputTokens: ev.outputTokens, costUsd: ev.costUsd, durationMs: ev.durationMs });
          break;

        case 'error':
          emit(run, 'error', { message: ev.message });
          break;

        case 'done':
          finalExitCode = ev.exitCode;
          break;
      }
    }

    const status = run.cancelRequested ? 'canceled'
      : finalExitCode === 0 ? 'succeeded'
      : 'failed';

    db.prepare(`UPDATE messages SET run_status = ?, events_json = ?, ended_at = ? WHERE id = ?`)
      .run(status, JSON.stringify(persisted), Date.now(), run.messageId);

    if (newClaudeSessionId) {
      db.prepare(`UPDATE sessions SET claude_session_id = ?, updated_at = ? WHERE id = ?`)
        .run(newClaudeSessionId, Date.now(), session.id);
    }

    db.prepare(`UPDATE sessions SET updated_at = ? WHERE id = ?`)
      .run(Date.now(), session.id);

    finish(run, status, finalExitCode);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    db.prepare(`UPDATE messages SET run_status = 'failed', ended_at = ? WHERE id = ?`)
      .run(Date.now(), run.messageId);
    emit(run, 'error', { message: msg });
    finish(run, 'failed', null);
  }
}

function resolveAllowedTools(session: SessionRow): string[] | undefined {
  if (session.permission_mode === 'bypass_all') return undefined;
  if (session.permission_mode === 'auto_reads') return ['Read', 'Grep', 'LS', 'Glob', 'Find', 'Bash'];
  const tools: string[] = JSON.parse(session.allowed_tools || '[]');
  return tools.length > 0 ? tools : undefined;
}
