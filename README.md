# cc-webui

Browser-based WebUI for [Claude Code](https://claude.ai/code). Run Claude Code locally from any browser — with streaming tool-call visualization, inline permission management, file diff inspector, and a warm-paper Anthropic design system.

## Features

- **Multi-session management** — sidebar with project / session switching
- **Streaming chat** — real-time tool-call artifact cards (Read · Write · Edit · Bash · Grep)
- **Permission gate** — approve / deny / always-allow per tool invocation
- **Inspector panel** — Files · Diff · Terminal · Plan tabs, live token usage
- **MCP server manager** — status, tool count, latency per server
- **Settings** — model, API key, working directory, auto-approve rules, token budget
- **Light + dark theme** — warm-paper palette (⌘K to toggle)
- **⌘K command palette**

## Architecture

```
apps/
  web/      Vite 5 + React 18 + TypeScript  (dev port 5173)
  daemon/   Node 20 + Express + better-sqlite3  (port 7457)
packages/
  contracts/  Shared TypeScript types — SSE events, HTTP shapes
```

The daemon wraps the `claude` CLI (`--output-format stream-json`) and streams all events to the web via Server-Sent Events. Conversation history is persisted in SQLite at `~/.cc-webui/db.sqlite`. The Claude CLI session ID is stored per conversation so multi-turn context is preserved via `--resume`.

## Quick start

```bash
# Prerequisites: node >=20, pnpm >=9, claude CLI installed & authenticated
npm i -g pnpm
pnpm install
pnpm dev
# → web:    http://localhost:5173
# → daemon: http://localhost:7457
```

## Permission modes

| Mode | Behaviour |
|---|---|
| `bypass_all` | `--dangerously-skip-permissions` — Claude runs freely |
| `auto_reads` | `--allowed-tools Read,Grep,LS,Glob` — writes & bash need UI approval |
| `manual` | Configurable allowlist per session |

## Design system

- **Type:** Source Serif 4 (display) · Geist (body) · Geist Mono (code)
- **Light palette:** `#F1ECDF` page · `#FBF8F1` surface · `#C96442` rust accent
- **Dark palette:** `#16130F` page · `#1E1A14` surface · `#E08968` rust accent
- **Shadows, radii, and all tokens** are in `apps/web/src/index.css`
