import { spawn, type ChildProcess } from 'child_process';
import * as readline from 'readline';
import type { PermissionMode } from '@cc-webui/contracts';

export interface ClaudeRunOptions {
  cwd: string;
  prompt: string;
  model?: string;
  claudeSessionId?: string;
  permissionMode?: PermissionMode;
  allowedTools?: string[];
  maxTurns?: number;
}

export type ClaudeEvent =
  | { type: 'init'; model: string; claudeSessionId: string }
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; toolUseId: string; content: string; isError: boolean }
  | { type: 'usage'; inputTokens: number; outputTokens: number; costUsd: number; durationMs: number }
  | { type: 'error'; message: string }
  | { type: 'done'; exitCode: number | null };

export function spawnClaude(opts: ClaudeRunOptions): {
  child: ChildProcess;
  events: AsyncGenerator<ClaudeEvent>;
} {
  const args: string[] = ['--print', '--output-format', 'stream-json', '--verbose'];

  if (opts.model) args.push('--model', opts.model);
  if (opts.claudeSessionId) args.push('--resume', opts.claudeSessionId);
  if (opts.maxTurns) args.push('--max-turns', String(opts.maxTurns));

  // Permission mode
  if (opts.permissionMode === 'bypass_all') {
    args.push('--dangerously-skip-permissions');
  } else if (opts.allowedTools && opts.allowedTools.length > 0) {
    args.push('--allowedTools', opts.allowedTools.join(','));
  }

  args.push(opts.prompt);

  const child = spawn('claude', args, {
    cwd: opts.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  return { child, events: parseStream(child) };
}

async function* parseStream(child: ChildProcess): AsyncGenerator<ClaudeEvent> {
  const rl = readline.createInterface({ input: child.stdout!, crlfDelay: Infinity });

  // Buffer lines and resolve when new data arrives
  const queue: string[] = [];
  let notify: (() => void) | null = null;
  let closed = false;

  rl.on('line', line => {
    if (line.trim()) { queue.push(line); notify?.(); }
  });
  rl.on('close', () => { closed = true; notify?.(); });

  while (!closed || queue.length > 0) {
    if (queue.length === 0) {
      await new Promise<void>(r => { notify = r; });
      notify = null;
      continue;
    }
    const line = queue.shift()!;
    let obj: Record<string, unknown>;
    try { obj = JSON.parse(line); } catch { continue; }

    for (const ev of mapObj(obj)) yield ev;
  }

  const exitCode = await new Promise<number | null>(r => {
    if (child.exitCode !== null) { r(child.exitCode); return; }
    child.on('exit', r);
  });
  yield { type: 'done', exitCode };
}

function mapObj(obj: Record<string, unknown>): ClaudeEvent[] {
  const t = obj.type as string;
  const events: ClaudeEvent[] = [];

  if (t === 'system' && obj.subtype === 'init') {
    events.push({
      type: 'init',
      model: (obj.model as string) ?? '',
      claudeSessionId: (obj.session_id as string) ?? '',
    });
    return events;
  }

  if (t === 'assistant') {
    const msg = obj.message as Record<string, unknown> | undefined;
    const content = (msg?.content as unknown[]) ?? [];
    for (const block of content) {
      const b = block as Record<string, unknown>;
      if (b.type === 'text' && b.text) {
        events.push({ type: 'text', text: b.text as string });
      }
      if (b.type === 'tool_use') {
        events.push({ type: 'tool_use', id: b.id as string, name: b.name as string, input: b.input });
      }
    }
    return events;
  }

  if (t === 'user') {
    const msg = obj.message as Record<string, unknown> | undefined;
    const content = (msg?.content as unknown[]) ?? [];
    for (const block of content) {
      const b = block as Record<string, unknown>;
      if (b.type === 'tool_result') {
        const raw = b.content;
        const text = Array.isArray(raw)
          ? (raw as Array<Record<string, string>>).map(c => c.text ?? '').join('\n')
          : String(raw ?? '');
        events.push({
          type: 'tool_result',
          toolUseId: b.tool_use_id as string,
          content: text,
          isError: Boolean(b.is_error),
        });
      }
    }
    return events;
  }

  if (t === 'result') {
    events.push({
      type: 'usage',
      inputTokens: 0,
      outputTokens: 0,
      costUsd: (obj.total_cost_usd as number) ?? 0,
      durationMs: (obj.duration_ms as number) ?? 0,
    });
    return events;
  }

  return events;
}

// Detect claude CLI
export async function detectClaude(): Promise<{ available: boolean; version?: string }> {
  return new Promise(resolve => {
    const p = spawn('claude', ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    p.stdout?.on('data', d => { out += d; });
    p.on('error', () => resolve({ available: false }));
    p.on('close', () => resolve({ available: true, version: out.trim() }));
  });
}
