import { useEffect, useRef } from 'react';
import { Composer } from '../chat/Composer.js';
import { Message } from '../chat/Message.js';
import { Pill } from '../atoms/Pill.js';
import { CopyIcon, DotsIcon } from '../atoms/icons.js';
import { useStore } from '../../store/index.js';
import { useRunStream } from '../../hooks/useRunStream.js';

export function ChatMain() {
  const { activeSessionId, sessions, messages } = useStore(s => ({
    activeSessionId: s.activeSessionId,
    sessions: s.sessions,
    messages: s.messages,
  }));

  const session = sessions.find(s => s.id === activeSessionId);
  const msgs = activeSessionId ? (messages[activeSessionId] ?? []) : [];
  const isRunning = msgs.some(m => m.runStatus === 'running' || m.runStatus === 'queued');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  // Stream active run if any
  const activeRunId = msgs.find(m => m.runStatus === 'running' || m.runStatus === 'queued')?.runId ?? null;
  useRunStream(activeRunId);

  return (
    <main className="paper" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Scroll area */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ padding: '32px 40px 12px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {/* Session header */}
          {session && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {isRunning
                  ? <Pill tone="rust" dot sm>Running</Pill>
                  : <Pill tone="ghost" sm>Idle</Pill>
                }
                <div style={{ flex: 1 }} />
                <button className="btn ghost sm"><CopyIcon size={13} />Share</button>
                <button className="btn ghost sm"><DotsIcon size={13} /></button>
              </div>
              <h1 className="t-display" style={{ margin: 0, fontSize: 26 }}>
                {session.title ?? 'New session'}
              </h1>
            </div>
          )}

          {!session && (
            <div style={{ paddingTop: 80, textAlign: 'center', color: 'var(--muted)' }}>
              <div className="t-serif" style={{ fontSize: 22, marginBottom: 8, color: 'var(--ink-2)' }}>
                Welcome to Claude Code WebUI
              </div>
              <div style={{ fontSize: 14 }}>Create a new session to get started</div>
            </div>
          )}

          {/* Messages */}
          {msgs.map(m => <Message key={m.id} message={m} />)}

          {/* Streaming indicator */}
          {isRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12.5, padding: '4px 0 24px 38px' }}>
              {[0, 1, 2].map(i => (
                <i key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--rust)',
                  display: 'inline-block',
                  animation: `cc-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
              <span style={{ marginLeft: 4 }}>Claude is working…</span>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '14px 40px 22px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        <Composer />
      </div>
    </main>
  );
}
