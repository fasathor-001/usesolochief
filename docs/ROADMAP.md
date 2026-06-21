# Roadmap

## Phase 0 — Foundation and Case Study *(complete)*

- [x] Domain registration: solochief.app + usesolochief.com
- [x] Repository initialised: fasathor-001/solochief-ai
- [x] Tech stack decided and documented
- [x] Complete /docs suite created
- [x] Supabase schema (30 tables, RLS, UUID PKs)
- [x] Railway deployment via Docker
- [x] Next.js 16 foundation: auth, dashboard shell, placeholder pages
- [ ] Coming soon page live on usesolochief.com
- [ ] 30-day manual case study running (SoloChief process without the software)
- [ ] Waitlist capturing emails

---

## Phase 1 — Web Command Centre *(building now)*

The full product delivered as a web application. No WhatsApp yet.

**Commitment Inventory**
- [ ] Commitment CRUD with stage and permission levels
- [ ] Stage change logging to commitment_events
- [ ] Filters by stage and category
- [ ] Permission level auto-suggestion

**Onboarding**
- [ ] Free-text commitment entry and parsing
- [ ] First weekly plan setup
- [ ] First today focus confirmation
- [ ] Workspace auto-creation

**Planning**
- [ ] Weekly plan: theme, priorities, outcomes
- [ ] Plan lock and unlock with event logging
- [ ] Stop list management
- [ ] Not-today list

**Daily Execution**
- [ ] Today Focus screen with confirmation
- [ ] Status updates: done / partial / blocked / slipped / switched
- [ ] Switch challenge mechanic
- [ ] Correction flow (undo / correct)

**Supporting Features**
- [ ] Parking Lot with trade-off capture
- [ ] Follow-up Tracker with due dates
- [ ] Launch Checklist (10-item max, swap rule)
- [ ] Blockers tracking

**Review**
- [ ] Friday Review: energy + focus ratings, outcome review per commitment
- [ ] Review Agent summary and pattern detection
- [ ] Draft next week's plan from review data

**AI**
- [ ] AI Chat with context package
- [ ] Planning Agent (Monday planning)
- [ ] Focus Agent (switch challenge + parking suggestions)
- [ ] Follow-up Agent (overdue follow-up surfacing)
- [ ] Review Agent (Friday synthesis)
- [ ] ai_actions validation pipeline

**Infrastructure**
- [ ] Polar billing: Free / Solo / Pro / Founder
- [ ] Feature gating by subscription tier
- [ ] Notification preferences settings
- [ ] Privacy, Terms, and Support pages

**Launch**
- [ ] solochief.app live with real users
- [ ] 3+ founders using it daily for 4+ weeks
- [ ] Zero open critical bugs

---

## Phase 2 — WhatsApp Pocket Chief of Staff

Do not begin until Phase 1 is stable and in daily use.

- [ ] Twilio WhatsApp Business API integration
- [ ] Phone number verification flow
- [ ] Inbound webhook: command parsing + natural language fallback
- [ ] Outbound sender with quiet hours enforcement
- [ ] Morning focus confirmation via WhatsApp
- [ ] Midday check-in
- [ ] EOD debrief
- [ ] Friday review via WhatsApp
- [ ] Follow-up nudges
- [ ] Cron jobs: morning / midday / EOD / Friday / follow-up check
- [ ] Correction commands: undo / correct that / wrong
- [ ] Pro and Founder plan WhatsApp gating

---

## Phase 3 — Pattern Intelligence

- [ ] Attention Debt Score: weighted score of neglected high-permission commitments
- [ ] Pattern Detection Agent: recurring slippage, context-switching habits, under-prioritised areas
- [ ] Capacity Planning: model available focus hours vs. commitment load per week
- [ ] Overwhelm Reset flow: guided triage when system detects overload
- [ ] Decision Log: record of significant commitment decisions and trade-offs
- [ ] Weekly Scorecard: visual summary of week performance
- [ ] Expanded AI chat: multi-turn planning conversations with memory

---

## Phase 4 — Integrations and Templates

- [ ] Templates: launch week mode, maintenance mode, client sprint mode
- [ ] Calendar read integration (blocked time awareness)
- [ ] Notion import for existing commitment lists
- [ ] Zapier / Make webhook for custom integrations
- [ ] API access for power users
- [ ] Weekly digest email (opt-in)

---

## Not on the Roadmap

The following are explicitly not planned. If this changes, a DECISIONS.md entry is required.

- Team accounts
- Kanban boards
- Full task management (subtasks, dependencies)
- Mobile native app (iOS / Android)
- Student / life admin / creator modes
- AI that writes to the database directly
