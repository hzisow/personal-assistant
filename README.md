# personal-assistant

A Claude-native personal assistant for Henry. Every morning by **7:00 AM ET**
it reads your calendar, Gmail, and Google Tasks, checks Boston weather and
your news topics, then delivers a **brief for the day** three ways:

1. **Dashboard** — [claude.ai/code/artifact/84dbc666…](https://claude.ai/code/artifact/84dbc666-7e0f-4fe4-8235-965757953769) (private, same URL every day — bookmark it)
2. **Email** — the same brief in your inbox
3. **Push** — a one-line notification when it's ready

It never schedules anything, never sends email on your behalf (other than the
brief itself), and never touches your data beyond reading it. Those are hard
boundaries recorded in `CLAUDE.md` and `config/preferences.yaml`.

## How it works
There's no server. A scheduled Routine wakes the owning Claude session at
6:40 AM ET, which runs `.claude/skills/morning-brief/SKILL.md`: gather →
compose (`briefs/YYYY-MM-DD.json` + `.md`) → publish dashboard → email + push
→ commit. See `docs/ARCHITECTURE.md`, including the path to a standalone web
app later.

## Changing its behavior
Three equally valid ways — user edits always win:
- Edit `config/preferences.yaml` (sections, topics, timing, calendars) or
  `config/email-rules.yaml` (what email gets surfaced)
- **Reply to any brief email** in plain English ("stop showing Recall reviews",
  "always surface anything from my advisor")
- Tell Claude in a session on this repo

## One-time setup remaining
- [ ] **Authorize Google Tasks** (30 seconds): open the auth link in
  `config/preferences.yaml → tasks.auth_url` and approve. The next brief picks
  it up automatically.

## Notes
- Cron runs in UTC; the assistant self-corrects the ~1h drift when DST flips.
- Push notifications reach your phone when the Claude app's remote connection
  is active; otherwise the dashboard + email still arrive.
