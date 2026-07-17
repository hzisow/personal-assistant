# Architecture — native now, app later

## Phase 1 (now): Claude-native
No hosted code. The assistant is a Claude Code session bound to this repo plus
a daily Routine.

```
06:40 ET  Routine fires into the owning Claude session
   │
   ├─ git pull (pick up preference edits)
   ├─ gather   Google Calendar ─ MCP connector
   │           Gmail (read)    ─ MCP connector
   │           Google Tasks    ─ Zapier MCP (GoogleTasksCLIAPI)
   │           Granola notes   ─ MCP connector (meeting prep, when relevant)
   │           weather         ─ wttr.in
   │           news            ─ web search
   ├─ compose  briefs/YYYY-MM-DD.json  (data contract, see brief-schema.json)
   │           briefs/YYYY-MM-DD.md    (human version)
   ├─ publish  dashboard/index.html → private artifact (stable URL)
   ├─ deliver  email via Zapier gmail_send_email (HTML)
   │           push via PushNotification
   └─ persist  state/state.json, memory/*, commit + push
```

Design decisions that matter:
- **The Routine self-binds to the owning session** (not a fresh headless
  session) because the Gmail/Calendar/Drive/Granola connectors are
  interactively authenticated there. A fresh session might not have them.
- **Config-as-data**: everything tunable lives in `config/*.yaml`, never in
  the skill text, so behavior changes don't require re-engineering.
- **JSON before prose**: every brief is generated as structured JSON first;
  markdown, dashboard HTML, and the email are all renderings of it.
- **Cron is UTC**: 10:40 UTC = 06:40 EDT. When DST flips (Nov/Mar), the daily
  self-check detects the drift and updates the trigger itself.

## Phase 2 (later): standalone app
The JSON data contract makes this a pure addition, not a rewrite:

- **Dashboard app** (e.g. Next.js): reads `briefs/*.json` from this repo (or a
  Supabase mirror) and renders history, search, and richer interactions.
  `dashboard/index.html` is the reference rendering to evolve from.
- **Generation service**: the morning pipeline moves from a Routine prompt to a
  scheduled job calling the Claude Agent SDK with the same MCP servers; the
  skill file becomes the system prompt. Preferences YAML schema is unchanged.
- **Auth**: replace session-bound connectors with the app's own Google OAuth
  (calendar.readonly, gmail.readonly, tasks.readonly) — scopes stay read-only
  to preserve the boundaries.
- Migration order when the time comes: (1) mirror briefs to a DB, (2) build the
  read-only dashboard app, (3) move generation, (4) retire the Routine.

## Data contract
`docs/brief-schema.json` — versioned (`schema_version`). Extend by adding
fields, never repurposing them; the dashboard and future app read the same files.
