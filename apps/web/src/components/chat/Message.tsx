import { Avatar } from '../atoms/Avatar.js';
import { ToolCard } from './ToolCard.js';
import { PermissionBar } from './PermissionBar.js';
import type { Message as MsgType } from '@cc-webui/contracts';

interface Props { message: MsgType; }

export function Message({ message }: Props) {
  const isUser = message.role === 'user';

  // Collect text and tool events
  const textEvents = message.events.filter(e => e.kind === 'text');
  const toolUseEvents = message.events.filter(e => e.kind === 'tool_use');
  const toolResultMap = new Map(
    message.events.filter(e => e.kind === 'tool_result').map(e => [e.kind === 'tool_result' ? e.toolUseId : '', e])
  );

  const displayText = textEvents.map(e => e.kind === 'text' ? e.text : '').join('') || message.content;

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'flex-start', animation: 'fade-in .2s ease' }}>
      <Avatar kind={isUser ? 'user' : 'claude'} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="t-serif" style={{ fontSize: 14, fontWeight: 500 }}>
            {isUser ? 'You' : 'Claude'}
          </span>
          <span className="t-meta">
            {message.endedAt
              ? new Date(message.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : message.startedAt
              ? new Date(message.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'just now'}
          </span>
        </div>

        {/* Text content */}
        {displayText && (
          <div className="t-body" style={{ color: isUser ? 'var(--ink)' : 'var(--ink-2)', maxWidth: 720, marginBottom: toolUseEvents.length > 0 ? 10 : 0 }}>
            {displayText}
            {!isUser && message.runStatus === 'running' && (
              <span style={{
                display: 'inline-block', width: 2, height: '1em',
                background: 'var(--rust)', marginLeft: 1, verticalAlign: 'text-bottom',
                animation: 'blink .9s step-end infinite',
              }} />
            )}
          </div>
        )}
        {/* Waiting for first token */}
        {!isUser && !displayText && message.runStatus === 'running' && (
          <div className="t-body" style={{ color: 'var(--muted)' }}>
            <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: 'var(--rust)', verticalAlign: 'text-bottom',
              animation: 'blink .9s step-end infinite',
            }} />
          </div>
        )}

        {/* Tool cards */}
        {!isUser && toolUseEvents.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: displayText ? 10 : 0 }}>
            {toolUseEvents.map(ev => {
              if (ev.kind !== 'tool_use') return null;
              const result = toolResultMap.get(ev.id);
              return (
                <ToolCard
                  key={ev.id}
                  tool={ev.name}
                  input={ev.input as Record<string, unknown>}
                  result={result?.kind === 'tool_result' ? result : undefined}
                  awaiting={message.runStatus === 'running' && !result}
                />
              );
            })}
          </div>
        )}

        {/* Permission bar for running message awaiting approval */}
        {message.runStatus === 'running' && toolUseEvents.some(e => e.kind === 'tool_use' && (e.name === 'Bash' || e.name === 'Write' || e.name === 'Edit')) && (
          <PermissionBar runId={message.runId!} lastTool={toolUseEvents[toolUseEvents.length - 1]} />
        )}
      </div>
    </div>
  );
}
