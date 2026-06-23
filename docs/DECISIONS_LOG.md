# Decisions Log

This file explains the reasoning behind each decision in `DECISIONS.md`.
`DECISIONS.md` is the source of truth. This file adds context.
Both files are append-only — never edit existing entries.

---

## D-001 — Domain solochief.app secured June 21 2026 on Cloudflare

`solochief.app` is the primary product domain. The `.app` TLD signals a software product and
is HTTPS-enforced by the registry. Cloudflare provides DNS, DDoS protection, and proxy at no
additional cost. Secured on the same day the project was initialised to prevent squatting.

---

## D-002 — Domain usesolochief.com secured June 21 2026 on Cloudflare

`usesolochief.com` is the marketing and coming-soon domain. A `.com` is more recognisable
in marketing contexts (social links, business cards, word of mouth). The pattern
`use<productname>.com` is common for products whose primary TLD is already taken or
is a specialised extension. Cloudflare Pages will serve the marketing site.

---

## D-003 — Stack — Next.js 16 + Supabase + Anthropic API claude-sonnet-4-6 + Railway + Polar + Resend

**Next.js:** App Router enables server components and server actions, which are required for
the RLS-safe, server-side-first data model SoloChief uses.

**Supabase:** Provides Postgres, Auth, Storage, and RLS in a single managed platform.
The solo founder does not need to manage database infrastructure.

**Anthropic API:** claude-sonnet-4-6 was the current production model at project initialisation.
The model is specified in DECISIONS.md so future engineers know what was used — not hardcoded
in product copy, since the model will be updated as better versions ship.

**Railway:** Docker-based deployment with minimal configuration. Simpler than Vercel for a
product that may eventually need background workers (cron, WebSockets). Dockerfile gives
full control over the runtime.

**Polar:** Open-source-aligned billing platform. Simpler API than Stripe for indie products.
No platform lock-in — Polar can be replaced with Stripe if needed.

**Resend:** Simple transactional email with excellent deliverability and a clean API.
Used only for auth, billing, and digest — not for check-in notifications.

---

## D-004 — Phase 1 is web command centre only — no WhatsApp until Phase 2

WhatsApp integration adds platform risk (Meta policy), operational complexity (Twilio billing,
message templates, phone verification), and per-message cost. Building it before the core
product logic is solid and in use is premature. The web interface must be fully functional
independently. WhatsApp is the habit layer — building the habit layer before the core product
is ready is backwards.

---

## D-005 — UK spelling throughout all copy and code comments

The founder is South African. The product is aimed at a global audience but written from a
British-English baseline. UK spelling is the Astor Stack standard. It must be enforced
consistently — mixing spellings is unprofessional and confusing for contributors.

---

## D-006 — No Co-Authored-By trailer on any commits — author Frank A. fasathor@gmail.com only

Commits represent authorship of the work. Claude Code is a tool. Listing an AI model as
a co-author misrepresents the commit history and adds noise. All commits are authored by
Frank A. using the git config set at project initialisation.

---

## D-007 — RLS enabled on every Supabase table from day one — no exceptions

RLS is the last line of defence against cross-user data access. Enabling it from day one
means the codebase never has an "unsafe period" during which a bug could expose user data.
Every table added to the schema must have RLS enabled in the same migration. There are no
exceptions — even tables that seem internal must be RLS-protected or be accessed only via
service role with explicit justification.

---

## D-008 — AI proposes, system validates, database writes — AI never writes directly to database

AI models can hallucinate. They can produce structurally valid but semantically wrong output.
Allowing an AI to write directly to a production database risks corrupting user data, creating
phantom commitments, marking real work as done when it is not, or deleting records.
The `ai_actions` table exists as a validation buffer. No AI response is applied to the
database without passing through server-side validation logic first.

---

## D-009 — Unknown is a first-class status — silence never equals completion

Many productivity tools assume that if an item has no update, it is in progress or done.
This produces inaccurate weekly reviews and overconfident AI advice. SoloChief treats
`unknown` as a real status with real meaning: "We do not know what happened." This honest
accounting drives better AI confidence scoring and more useful Friday reviews.

---

## D-010 — Context package loads before every AI call — no exceptions

An AI call without context produces generic advice. SoloChief's value proposition depends
on the AI knowing the user's current commitments, stage, weekly plan, focus status, and
recent patterns. Loading the context package before every call ensures the AI always has
the information it needs to give specific, accurate advice. Pre-computing and caching the
context snapshot in `context_snapshots` prevents excessive database queries per call.

---

## D-011 — Next.js 16.2.9 installed — proxy.ts used instead of middleware.ts

`create-next-app@latest` installed Next.js 16.2.9 rather than 15.x. Next.js 16 renames
the route protection file from `middleware.ts` to `proxy.ts` and changes the export name
from `middleware` to `proxy`. The project was updated to use `src/proxy.ts` with the
`proxy` export to eliminate the deprecation warning.

---

## D-012 — Commitment Inventory built as first real feature — core brain of product

All other features depend on commitments existing. Without a working commitment inventory,
today focus, weekly planning, switch challenge, and AI context are all impossible.
Building commitment CRUD first gives every subsequent feature a stable data foundation.

---

## D-013 — Stage changes always logged to commitment_events table

Stage changes are the most significant state transitions in SoloChief. Moving a commitment
from `active` to `parked` or from `maintenance` to `main_focus` is a decision. Decisions
should be logged. The log enables the Friday Review Agent to surface patterns ("You parked
Legal Admin 3 weeks in a row") and enables the user to understand their own behaviour.

---

## D-014 — Permission level auto-suggested based on stage selection

Permission level is a conceptually complex field. Auto-suggesting it from the stage reduces
cognitive load during commitment creation and produces sensible defaults for 80% of cases.
The user can always override the suggestion. The mapping is documented in DATABASE.md.

---

## D-015 — Workspace auto-created on first login if none exists

Requiring a separate onboarding step to create a workspace before accessing the dashboard
adds friction with no user benefit. The workspace is auto-created with sensible defaults
(name: "My Workspace", type: "personal") on first login. The profile is marked as onboarded
at the same time. A dedicated onboarding UI can guide the user through commitment setup
without gating workspace creation.

---

## D-016 — Complete /docs suite created — mandatory Astor Stack build standard

The /docs suite is created before feature development begins. Documentation written after
the fact is rarely accurate and rarely complete. Writing docs first forces clarity about
what is being built, why, and how. The docs suite also serves as onboarding material for
any future contributors and as a reference for Claude Code in subsequent sessions.
