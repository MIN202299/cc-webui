import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router = Router();

interface McpConfig {
  mcpServers?: Record<string, { command?: string; args?: string[] }>;
}

function readMcpConfig(): McpConfig {
  const candidates = [
    path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json'),
    path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  ];
  for (const p of candidates) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as McpConfig; } catch {}
  }
  return {};
}

router.get('/', (_req, res) => {
  const config = readMcpConfig();
  const servers = Object.entries(config.mcpServers ?? {}).map(([name, srv]) => ({
    name,
    state: 'idle' as const,
    tools: 0,
    latency: '—',
    pkg: srv.command,
  }));
  res.json(servers);
});

export default router;
