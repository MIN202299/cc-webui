import { useEffect, useRef } from 'react';
import { useStore } from '../store/index.js';
import type { AgentPayload } from '@cc-webui/contracts';

/**
 * Opens an SSE connection to /api/runs/:id/events and dispatches
 * incoming agent events into the store.
 */
export function useRunStream(runId: string | null) {
  const esRef = useRef<EventSource | null>(null);
  const sessionId = useStore(s => s.activeSessionId);
  const { appendEventToLastAssistant, updateLastAssistantStatus, loadMessages, setPendingPermission } = useStore(s => ({
    appendEventToLastAssistant: s.appendEventToLastAssistant,
    updateLastAssistantStatus: s.updateLastAssistantStatus,
    loadMessages: s.loadMessages,
    setPendingPermission: s.setPendingPermission,
  }));

  useEffect(() => {
    if (!runId || !sessionId) return;

    // Close any existing stream
    esRef.current?.close();

    const es = new EventSource(`/api/runs/${runId}/events`);
    esRef.current = es;

    es.addEventListener('agent', (e: MessageEvent) => {
      const payload = JSON.parse(e.data) as AgentPayload;

      switch (payload.type) {
        case 'text_delta':
          appendEventToLastAssistant(sessionId, { kind: 'text', text: payload.delta });
          break;

        case 'tool_use':
          appendEventToLastAssistant(sessionId, { kind: 'tool_use', id: payload.id, name: payload.name, input: payload.input });
          break;

        case 'tool_result':
          appendEventToLastAssistant(sessionId, { kind: 'tool_result', toolUseId: payload.toolUseId, content: payload.content, isError: payload.isError });
          break;

        case 'usage':
          appendEventToLastAssistant(sessionId, { kind: 'usage', inputTokens: payload.inputTokens, outputTokens: payload.outputTokens, costUsd: payload.costUsd, durationMs: payload.durationMs });
          break;

        case 'permission_request':
          setPendingPermission({ runId, tool: payload.tool, input: payload.input });
          break;

        case 'status':
          appendEventToLastAssistant(sessionId, { kind: 'status', label: payload.label });
          break;
      }
    });

    es.addEventListener('start', () => {
      updateLastAssistantStatus(sessionId, 'running');
    });

    es.addEventListener('end', async (e: MessageEvent) => {
      const data = JSON.parse(e.data) as { status: string };
      updateLastAssistantStatus(sessionId, data.status);
      es.close();
      // Reload messages to get persisted events from DB
      setTimeout(() => loadMessages(sessionId), 500);
    });

    es.addEventListener('error', () => {
      es.close();
    });

    return () => { es.close(); esRef.current = null; };
  }, [runId, sessionId]);
}
