import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db, getSettings } from '../db.js';
import { createRun } from '../runs.js';
import { startRun } from '../runner.js';

const router = Router();

// List sessions
router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) AS message_count,
      (SELECT MAX(m.created_at) FROM messages m WHERE m.session_id = s.id) AS last_message_at
    FROM sessions s ORDER BY s.updated_at DESC
  `).all() as Record<string, unknown>[];

  res.json(rows.map(normalizeSession));
});

// Create session
router.post('/', (req, res) => {
  const { cwd, title, model, permissionMode } = req.body as Record<string, string>;
  if (!cwd) return void res.status(400).json({ error: 'cwd is required' });

  const s = getSettings();
  const id = randomUUID();
  const now = Date.now();

  db.prepare(`
    INSERT INTO sessions (id, cwd, title, model, permission_mode, allowed_tools, token_budget, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '[]', ?, ?, ?)
  `).run(id, cwd, title ?? null, model ?? s.defaultModel, permissionMode ?? s.permissionMode,
    parseInt(s.tokenBudget ?? '200000'), now, now);

  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown>;
  res.status(201).json(normalizeSession(row));
});

// Get session
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) return void res.status(404).json({ error: 'Not found' });
  res.json(normalizeSession(row));
});

// Delete session
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Update session title
router.patch('/:id', (req, res) => {
  const { title } = req.body as { title?: string };
  if (title !== undefined) {
    db.prepare('UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?')
      .run(title, Date.now(), req.params.id);
  }
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) return void res.status(404).json({ error: 'Not found' });
  res.json(normalizeSession(row));
});

// List messages
router.get('/:id/messages', (req, res) => {
  const msgs = db.prepare(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
  ).all(req.params.id) as Record<string, unknown>[];
  res.json(msgs.map(normalizeMessage));
});

// Post message → spawn run
router.post('/:id/messages', async (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!session) return void res.status(404).json({ error: 'Session not found' });

  const { content } = req.body as { content?: string };
  if (!content?.trim()) return void res.status(400).json({ error: 'content is required' });

  const userMsgId = randomUUID();
  const asstMsgId = randomUUID();
  const runId = randomUUID();
  const now = Date.now();

  db.prepare(`INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)`)
    .run(userMsgId, req.params.id, content, now);
  db.prepare(`INSERT INTO messages (id, session_id, role, run_id, run_status, events_json, started_at, created_at) VALUES (?, ?, 'assistant', ?, 'queued', '[]', ?, ?)`)
    .run(asstMsgId, req.params.id, runId, now, now);

  const run = createRun(runId, req.params.id, asstMsgId, session.model as string);

  // Start asynchronously — don't await
  startRun(session as Parameters<typeof startRun>[0], content, run).catch(console.error);

  res.status(202).json({ runId, messageId: asstMsgId, userMessageId: userMsgId });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeSession(r: Record<string, unknown>) {
  return {
    id: r.id,
    cwd: r.cwd,
    title: r.title,
    model: r.model,
    claudeSessionId: r.claude_session_id,
    permissionMode: r.permission_mode,
    allowedTools: JSON.parse((r.allowed_tools as string) || '[]'),
    tokenBudget: r.token_budget,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    messageCount: r.message_count ?? 0,
    lastMessageAt: r.last_message_at ?? null,
  };
}

function normalizeMessage(r: Record<string, unknown>) {
  return {
    id: r.id,
    sessionId: r.session_id,
    role: r.role,
    content: r.content,
    runId: r.run_id,
    runStatus: r.run_status,
    events: JSON.parse((r.events_json as string) || '[]'),
    startedAt: r.started_at,
    endedAt: r.ended_at,
    createdAt: r.created_at,
  };
}

export default router;
