import { Router } from 'express';
import { db, getSettings } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const s = getSettings();
  res.json({
    defaultModel: s.defaultModel,
    defaultCwd: s.defaultCwd,
    permissionMode: s.permissionMode,
    tokenBudget: parseInt(s.tokenBudget || '200000'),
    autoApproveReads: s.autoApproveReads === 'true',
    autoApproveGreps: s.autoApproveGreps === 'true',
    autoApproveWrites: s.autoApproveWrites === 'true',
    autoApproveBash: s.autoApproveBash === 'true',
  });
});

router.put('/', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  for (const [key, value] of Object.entries(body)) {
    upsert.run(key, String(value));
  }
  const s = getSettings();
  res.json(s);
});

export default router;
