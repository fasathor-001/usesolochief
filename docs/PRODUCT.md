# Product

## Name

**SoloChief AI** by Astor Stack

## Category

Personal AI Chief of Staff for commitments, focus, and follow-ups.

## Tagline

Command Centre on web. Chief of Staff in WhatsApp. One brain behind both.

## Core Promise

SoloChief AI does not help you do more. It helps you decide what deserves your attention.

## The Problem

Solo founders managing 2–8 active products simultaneously face a specific kind of overwhelm that
general productivity tools were not built for. They do not need another task list. They need
something that challenges them before they switch, enforces their own commitments, and surfaces
what they said mattered — even when they have forgotten.

## Launch ICP

Solo founders running 2–8 active products simultaneously. Typically:

- Building or maintaining products across different stages (pre-launch, active, maintenance)
- Wearing multiple hats: founder, product, admin, customer support, legal, finance
- Drowning in context-switching and small tasks that crowd out the main things
- Already using some combination of Notion, Todoist, and Supabase — and still losing focus

## Domains

| Purpose    | Domain                |
|------------|-----------------------|
| Product    | solochief.app         |
| Marketing  | usesolochief.com      |

Both domains secured 21 June 2026 on Cloudflare.

## Stack

| Layer         | Technology                                                     |
|---------------|----------------------------------------------------------------|
| Web           | Next.js 16 (App Router, TypeScript)                            |
| Database      | Supabase (Postgres + Auth + RLS)                               |
| AI            | Anthropic API — current Claude Sonnet model at implementation time |
| WhatsApp      | Twilio WhatsApp Business API (Phase 2)                         |
| Hosting       | Railway (Docker)                                               |
| Payments      | Polar                                                          |
| Email         | Resend                                                         |
| DNS / CDN     | Cloudflare                                                     |

## Phases

### Phase 1 — Web Command Centre (current)

The full brain of SoloChief: commitment inventory, permission levels, weekly planning,
today focus, switch challenge, parking lot, follow-ups, launch checklists, Friday review,
AI chat. Web only.

### Phase 2 — WhatsApp Pocket Chief of Staff

Daily rhythm enforced through WhatsApp: morning confirmation, midday check-in, EOD debrief,
Friday review. The web command centre remains the primary interface. WhatsApp is the habit layer.

### Phase 3 — Pattern Intelligence

Attention debt score, pattern detection agent, capacity planning, decision log, weekly scorecard.
The system starts to model the user's real workload across time.

## Parent Company

**Astor Stack Technologies**
