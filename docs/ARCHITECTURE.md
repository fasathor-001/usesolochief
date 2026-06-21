# Architecture

## Principle: One Brain, Two Interfaces

The database is the single source of truth. The web command centre and the WhatsApp
interface both read from and write to the same Postgres database via the same rules.
There is no separate WhatsApp-only state.

```
┌─────────────────────────────────────────────────────────────────┐
│                         THE BRAIN                               │
│                Supabase Postgres + Auth + RLS                   │
│   commitments · plans · logs · context · patterns · events      │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
┌─────────┴──────────┐       ┌──────────┴──────────┐
│  Web Command Centre│       │  WhatsApp Pocket CoS │
│   Next.js 16       │       │  Twilio (Phase 2)    │
│   Railway          │       │  Inbound / Outbound  │
│   solochief.app    │       │  Webhooks            │
└────────────────────┘       └─────────────────────┘
          │                             │
          └──────────────┬──────────────┘
                         │
              ┌──────────┴──────────┐
              │     AI Layer        │
              │  Anthropic API      │
              │  Four Agents        │
              │  Context Package    │
              └─────────────────────┘
```

## The Brain — Supabase Postgres

All data lives here. 30 tables. RLS on every table. UUID primary keys throughout.

- Commitments and their full lifecycle (stages, permissions, events)
- Weekly plans, outcomes, and daily focus
- Check-ins, logs, blockers, corrections
- AI messages, AI actions, agent runs
- Follow-ups, parking lot, launch checklists
- Context snapshots (pre-computed before AI calls)
- Notification preferences and delivery records

## Web Command Centre — Next.js 16

- App Router, TypeScript, Tailwind CSS, shadcn/ui
- Server Components for data fetching
- Server Actions for mutations (never direct client Supabase writes)
- Protected under `/dashboard`, public routes at `/`, `/auth/*`
- Middleware (`proxy.ts`) handles session refresh and route protection
- Deployed on Railway via Docker

## WhatsApp Pocket Chief of Staff — Twilio (Phase 2)

- Inbound webhook: `/api/whatsapp/inbound`
- Outbound sender: `/api/whatsapp/send`
- Cron triggers: morning focus, midday check, EOD debrief, Friday review, follow-up check
- Max 3 proactive messages per day per user
- Quiet hours enforced per user timezone
- All WhatsApp state is written to the same database — no separate WhatsApp store

## Email — Resend

Used for: magic link auth, billing receipts, weekly digest (optional), security alerts.
Not used for: daily check-ins, focus reminders — those are WhatsApp only (Phase 2).

## AI Layer — Anthropic API

Four agents, one `AIService` class, four system prompts.
Context package loaded before every single AI call — no exceptions (D-010).

Agents:
1. **Planning Agent** — Monday planning, weekly outcomes, main focus, stop list
2. **Focus Agent** — Switch challenge, not-today enforcement, parking suggestions
3. **Follow-up Agent** — Admin, legal, payment, client follow-up tracking
4. **Review Agent** — Friday review, pattern analysis, next week draft

See `/docs/AGENTS.md` for full specification.

## Rules Engine — Code, Not AI

Business rules are enforced by server-side code, not by AI judgement:

- One weekly override maximum
- Launch checklist frozen at 10 items
- No new commitment midweek without capacity check
- AI cannot write directly to database — propose only

See `/docs/RULES.md` for the full rules list.

## AI Write Safety

```
AI proposes → Server validates → Database writes
```

AI-proposed changes land in `ai_actions` table with `status = 'proposed'`.
A validation step sets `status = 'validated'` before any write to a production table.
The AI never calls a Supabase write directly. This is D-008 and is non-negotiable.

## Context Package

A structured JSON object assembled from the database and passed to every AI call.
Covers: commitments + stages + permissions + current week plan + today focus +
follow-ups + parking lot + launch checklists + switch requests + recent patterns + last review.
Pre-computed and stored in `context_snapshots` for performance.

See `/docs/CONTEXT_PACKAGE.md` for full specification.

## Deployment

Railway (Docker), Cloudflare DNS. See `/docs/DEPLOYMENT.md`.
