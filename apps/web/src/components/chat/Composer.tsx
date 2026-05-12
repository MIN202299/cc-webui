import { useState, useRef, type KeyboardEvent } from 'react';
import { Pill } from '../atoms/Pill.js';
import { ArrowUpIcon, PauseIcon, ShieldIcon, BoltIcon } from '../atoms/icons.js';
import { useStore } from '../../store/index.js';
import { api } from '../../api/client.js';

export function Composer() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { activeSessionId, addOptimisticMessage, loadMessages } = useStore(s => ({
    activeSessionId: s.activeSessionId,
    addOptimisticMessage: s.addOptimisticMessage,
    loadMessages: s.loadMessages,
  }));

  const isRunning = useStore(s => {
    const sid = s.activeSessionId;
    if (!sid) return false;
    return (s.messages[sid] ?? []).some(m => m.runStatus === 'running' || m.runStatus === 'queued');
  });

  const activeRunId = useStore(s => {
    const sid = s.activeSessionId;
    if (!sid) return null;
    return (s.messages[sid] ?? []).find(m => m.runStatus === 'running')?.runId ?? null;
  });

  async function send() {
    const text = value.trim();
    if (!text || !activeSessionId || isRunning) return;
    setValue('');

    addOptimisticMessage(activeSessionId, text);
    try {
      const res = await api.sendMessage(activeSessionId, text);
      await loadMessages(activeSessionId);
    } catch (err) {
      console.error('send failed', err);
    }
  }

  async function cancel() {
    if (activeRunId) await api.cancelRun(activeRunId);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{
      border: '1px solid var(--line-2)', borderRadius: 12,
      background: 'var(--surface)', padding: '10px 12px',
      boxShadow: 'var(--shadow-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={activeSessionId ? 'Ask Claude to make a change…' : 'Select or create a session first'}
          disabled={!activeSessionId || isRunning}
          rows={1}
          style={{
            flex: 1, resize: 'none', border: 'none', outline: 'none',
            background: 'transparent', fontFamily: 'var(--sans)', fontSize: 14,
            color: 'var(--ink)', lineHeight: 1.55, paddingTop: 2,
            minHeight: 42, maxHeight: 200, overflow: 'auto',
          }}
        />
        {isRunning
          ? <button className="btn ghost sm" style={{ height: 28, color: 'var(--rose)' }} onClick={cancel}><PauseIcon size={13} /></button>
          : <button className="btn accent sm" style={{ height: 28 }} onClick={send} disabled={!value.trim() || !activeSessionId}><ArrowUpIcon size={13} /></button>
        }
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--muted)', fontSize: 11.5 }}>
        <span className="kbd">⌘</span><span className="kbd">K</span>
        <span style={{ marginLeft: 4 }}>commands</span>
        <span style={{ margin: '0 4px' }}>·</span>
        <span className="kbd">↵</span>
        <span style={{ marginLeft: 4 }}>send · <span className="kbd">⇧↵</span> newline</span>
        <div style={{ flex: 1 }} />
        <Pill tone="ghost" sm><ShieldIcon size={11} />Plan mode</Pill>
        <Pill tone="ghost" sm><BoltIcon size={11} />Auto-reads</Pill>
      </div>
    </div>
  );
}
