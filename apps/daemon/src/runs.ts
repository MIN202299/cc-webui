import type { Response } from 'express';
import type { ChildProcess } from 'child_process';

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

interface StoredEvent { id: number; event: string; data: unknown; }

export interface Run {
  id: string;
  sessionId: string;
  messageId: string;
  status: RunStatus;
  model: string;
  startedAt: number;
  child: ChildProcess | null;
  cancelRequested: boolean;
  events: StoredEvent[];
  nextEventId: number;
  clients: Set<Response>;
  permissionResolve?: (decision: 'allow' | 'deny' | 'allow_always') => void;
}

const store = new Map<string, Run>();

export function createRun(id: string, sessionId: string, messageId: string, model: string): Run {
  const run: Run = {
    id, sessionId, messageId, model,
    status: 'queued',
    startedAt: Date.now(),
    child: null,
    cancelRequested: false,
    events: [],
    nextEventId: 1,
    clients: new Set(),
  };
  store.set(id, run);
  return run;
}

export function getRun(id: string): Run | undefined {
  return store.get(id);
}

export function emit(run: Run, event: string, data: unknown): void {
  const id = run.nextEventId++;
  run.events.push({ id, event, data });
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\nid: ${id}\n\n`;
  for (const client of run.clients) {
    try { client.write(msg); } catch { run.clients.delete(client); }
  }
}

export function attachClient(run: Run, res: Response, afterId?: number): void {
  for (const ev of run.events) {
    if (afterId == null || ev.id > afterId) {
      res.write(`event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\nid: ${ev.id}\n\n`);
    }
  }
  if (['succeeded', 'failed', 'canceled'].includes(run.status)) {
    res.end();
    return;
  }
  run.clients.add(res);
}

export function detachClient(run: Run, res: Response): void {
  run.clients.delete(res);
}

export function finish(run: Run, status: 'succeeded' | 'failed' | 'canceled', exitCode: number | null): void {
  run.status = status;
  emit(run, 'end', { status, exitCode, durationMs: Date.now() - run.startedAt });
  for (const client of run.clients) { try { client.end(); } catch {} }
  run.clients.clear();
  setTimeout(() => store.delete(run.id), 30 * 60 * 1000);
}
