import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

const DATA_DIR = process.env.CC_DATA_DIR ?? path.join(os.homedir(), '.cc-webui');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, 'db.sqlite');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    cwd             TEXT NOT NULL,
    title           TEXT,
    model           TEXT NOT NULL DEFAULT 'claude-sonnet-4-5',
    claude_session_id TEXT,
    permission_mode TEXT NOT NULL DEFAULT 'auto_reads',
    allowed_tools   TEXT NOT NULL DEFAULT '[]',
    token_budget    INTEGER NOT NULL DEFAULT 200000,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK(role IN ('user','assistant')),
    content     TEXT,
    run_id      TEXT,
    run_status  TEXT,
    events_json TEXT NOT NULL DEFAULT '[]',
    started_at  INTEGER,
    ended_at    INTEGER,
    created_at  INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed defaults without overwriting existing values
const defaults: Record<string, string> = {
  defaultModel: 'claude-sonnet-4-5',
  defaultCwd: os.homedir(),
  permissionMode: 'auto_reads',
  tokenBudget: '200000',
  autoApproveReads: 'true',
  autoApproveGreps: 'true',
  autoApproveWrites: 'false',
  autoApproveBash: 'false',
};
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(defaults)) insertSetting.run(k, v);

export { db };

export function getSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}
