import express from 'express';
import cors from 'cors';
import { detectClaude } from './claude.js';
import sessionsRouter from './routes/sessions.js';
import runsRouter from './routes/runs.js';
import filesRouter from './routes/files.js';
import settingsRouter from './routes/settings.js';
import mcpRouter from './routes/mcp.js';

const PORT = parseInt(process.env.CC_DAEMON_PORT ?? '7457', 10);
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/sessions', sessionsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/fs', filesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/mcp', mcpRouter);

app.get('/api/info', async (_req, res) => {
  const claude = await detectClaude();
  res.json({
    version: '0.1.0',
    models: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
    claudeAvailable: claude.available,
    claudeVersion: claude.version,
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`cc-webui daemon running at http://127.0.0.1:${PORT}`);
});
