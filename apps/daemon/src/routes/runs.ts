import { Router } from 'express';
import { getRun, attachClient, detachClient } from '../runs.js';

const router = Router();

// Get run status
router.get('/:id', (req, res) => {
  const run = getRun(req.params.id);
  if (!run) return void res.status(404).json({ error: 'Run not found' });
  res.json({
    id: run.id,
    sessionId: run.sessionId,
    messageId: run.messageId,
    status: run.status,
    model: run.model,
    createdAt: run.startedAt,
  });
});

// SSE event stream
router.get('/:id/events', (req, res) => {
  const run = getRun(req.params.id);
  if (!run) return void res.status(404).json({ error: 'Run not found' });

  const lastId = req.headers['last-event-id']
    ? parseInt(req.headers['last-event-id'] as string, 10)
    : (req.query['after'] ? parseInt(req.query['after'] as string, 10) : undefined);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Heartbeat to keep connection alive through proxies
  const heartbeat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 15_000);

  attachClient(run, res, lastId);

  req.on('close', () => {
    clearInterval(heartbeat);
    detachClient(run, res);
  });
});

// Cancel run
router.post('/:id/cancel', (req, res) => {
  const run = getRun(req.params.id);
  if (!run) return void res.status(404).json({ error: 'Run not found' });
  run.cancelRequested = true;
  run.child?.kill('SIGTERM');
  res.json({ ok: true });
});

export default router;
