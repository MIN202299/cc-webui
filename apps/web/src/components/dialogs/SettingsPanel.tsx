import { useState, useEffect } from 'react';
import { XIcon } from '../atoms/icons.js';
import { api } from '../../api/client.js';
import { useStore } from '../../store/index.js';
import type { Settings } from '@cc-webui/contracts';

const TABS = ['General', 'Model', 'Permissions', 'MCP', 'About'];

export function SettingsPanel() {
  const { open, closeSettings } = useStore(s => ({
    open: s.settingsOpen,
    closeSettings: s.closeSettings,
  }));

  const [tab, setTab] = useState('General');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) api.getSettings().then(setSettings);
  }, [open]);

  if (!open || !settings) return null;

  async function save() {
    if (!settings) return;
    setSaving(true);
    await api.updateSettings(settings);
    setSaving(false);
    closeSettings();
  }

  function toggle(key: keyof Settings) {
    setSettings(s => s ? { ...s, [key]: !s[key as keyof Settings] } : s);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(31,30,27,.42)', backdropFilter: 'blur(2px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 24,
    }}>
      <div style={{
        width: 'min(860px, 100%)', maxHeight: '90vh',
        background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14,
        boxShadow: 'var(--shadow-3)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 0', display: 'flex', alignItems: 'flex-end', gap: 14, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h2 className="t-display" style={{ margin: '0 0 6px', fontSize: 28 }}>Settings</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
              Configure how Claude Code runs. Per-project overrides live in{' '}
              <span className="t-mono">.claude/config.json</span>.
            </p>
          </div>
          <button className="btn ghost sm" onClick={closeSettings}><XIcon size={14} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 28px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 14px', fontSize: 13, background: 'transparent', border: 'none',
              borderBottom: tab === t ? '2px solid var(--rust)' : '2px solid transparent',
              color: tab === t ? 'var(--ink)' : 'var(--muted)',
              fontWeight: tab === t ? 500 : 400, cursor: 'pointer', fontFamily: 'var(--sans)',
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '0 28px 24px', overflowY: 'auto', flex: 1 }}>
          {tab === 'General' && (
            <>
              <Row label="Default working directory" hint="Used when starting a session without a project.">
                <Input value={settings.defaultCwd} mono onChange={v => setSettings(s => s ? { ...s, defaultCwd: v } : s)} />
              </Row>
              <Row label="Token budget" hint="Soft cap per session. Claude will warn before exceeding.">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Input value={String(settings.tokenBudget)} mono w={120} onChange={v => setSettings(s => s ? { ...s, tokenBudget: parseInt(v) || 200000 } : s)} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>tokens</span>
                </div>
              </Row>
            </>
          )}
          {tab === 'Model' && (
            <>
              <Row label="Default model" hint="Used for new sessions. Override per session from the model picker.">
                <SelectInput
                  value={settings.defaultModel}
                  options={['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5']}
                  onChange={v => setSettings(s => s ? { ...s, defaultModel: v } : s)}
                />
              </Row>
            </>
          )}
          {tab === 'Permissions' && (
            <>
              <Row label="Default permission mode" hint="Controls what Claude can do without asking.">
                <SelectInput
                  value={settings.permissionMode}
                  options={['bypass_all', 'auto_reads', 'manual']}
                  onChange={v => setSettings(s => s ? { ...s, permissionMode: v as Settings['permissionMode'] } : s)}
                />
              </Row>
              <Row label="Auto-approve reads" hint="Skip approval for Read, LS, Glob operations.">
                <Switch on={settings.autoApproveReads} onToggle={() => toggle('autoApproveReads')} />
              </Row>
              <Row label="Auto-approve greps" hint="Skip approval for Grep, Find operations.">
                <Switch on={settings.autoApproveGreps} onToggle={() => toggle('autoApproveGreps')} />
              </Row>
              <Row label="Auto-approve writes" hint="Skip approval for Write, Edit operations. Not recommended.">
                <Switch on={settings.autoApproveWrites} onToggle={() => toggle('autoApproveWrites')} />
              </Row>
              <Row label="Auto-approve bash" hint="Skip approval for Bash commands. Use with caution.">
                <Switch on={settings.autoApproveBash} onToggle={() => toggle('autoApproveBash')} />
              </Row>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn" onClick={closeSettings}>Cancel</button>
          <button className="btn accent" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, padding: '18px 0', borderTop: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.45 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Input({ value, mono, w, onChange }: { value: string; mono?: boolean; w?: number; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        height: 32, padding: '0 10px', border: '1px solid var(--line)',
        borderRadius: 6, background: 'var(--surface)', display: 'flex', alignItems: 'center',
        fontFamily: mono ? 'var(--mono)' : 'var(--sans)', fontSize: 13, color: 'var(--ink)',
        width: w ?? 320, outline: 'none',
      }}
    />
  );
}

function SelectInput({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      height: 32, padding: '0 10px', border: '1px solid var(--line)',
      borderRadius: 6, background: 'var(--surface)', fontSize: 13, color: 'var(--ink)', width: 220,
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      width: 34, height: 20, borderRadius: 999, cursor: 'pointer',
      background: on ? 'var(--rust)' : 'var(--line-2)', position: 'relative', transition: 'background .15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />
    </div>
  );
}
