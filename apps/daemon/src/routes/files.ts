import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// List directory
router.get('/', (req, res) => {
  const dir = (req.query['path'] as string) || process.env.HOME || '/';
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const result = entries
      .filter(e => !e.name.startsWith('.') || req.query['hidden'] === '1')
      .map(e => ({
        name: e.name,
        path: path.join(dir, e.name),
        type: e.isDirectory() ? 'dir' : 'file',
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    res.json({ path: dir, entries: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

// Read file content
router.get('/read', (req, res) => {
  const filePath = req.query['path'] as string;
  if (!filePath) return void res.status(400).json({ error: 'path required' });

  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 2 * 1024 * 1024) return void res.status(400).json({ error: 'File too large (>2MB)' });
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ path: filePath, content });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

export default router;
