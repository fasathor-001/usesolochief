# Features

## MVP — Phase 1 (Web Command Centre)

### 1. Onboarding and Commitment Inventory

First-run experience that guides the user through setting up their commitments.
Templates for common solo founder profiles. "What are you managing right now?" prompt.
After onboarding, the commitment inventory is the central list of everything the user is
responsible for, grouped by stage and filterable by category.

### 2. Permission Levels and Stages

Every commitment has a stage and a permission level. These two fields drive all AI behaviour
and rules enforcement.

**Stages:** main_focus · active · launch_checklist · maintenance · follow_up · parked

**Permission levels:** can_interrupt · protected_block · checklist_only · maintenance_only · follow_up_only · parked

Permission is auto-suggested when stage is selected. User can override.

### 3. Monday Command Centre

Weekly planning screen. Loads last week's review, shows current commitments, proposes this
week's focus. User locks the plan. The plan becomes the reference point for all week AI calls.

### 4. Today Focus Screen

The one screen the user should check daily. Shows the 1–3 focus commitments for today.
Morning confirmation required. Shows status of each item. Shows follow-ups due today.
Shows any blockers.

### 5. Stop List / Not Today List

Two distinct lists:
- **Stop List:** things the user has explicitly decided not to pursue this week
- **Not Today:** specific items blocked for today with a reason

Both are shown to the Focus Agent and factored into switch challenge logic.

### 6. Switch Challenge Mechanic *(killer feature)*

When the user tries to work on a `protected_block` or higher-restricted commitment instead
of their declared focus, SoloChief challenges them:

- Shows what they said the focus was
- Shows the permission level of what they want to switch to
- Asks for a reason
- Logs the switch request with reason and outcome
- Tracks switch patterns over time in the Friday review

This is the core differentiation. No other tool does this.

### 7. Parking Lot

A dedicated space for ideas and commitments that are real but not this week.
Items in the parking lot require a trade-off to enter the active week — what comes out
to make room? The Focus Agent surfaces parking lot items that keep appearing in logs.

### 8. Follow-up Tracker

Dedicated tracking for admin, legal, client, and payment follow-ups. Due dates, contact
references, completion tracking. The Follow-up Agent surfaces overdue items and suggests
batching similar follow-ups into a single admin block.

### 9. Launch Checklist Freezer

Pre-launch checklists linked to a specific commitment. Maximum 10 items per checklist.
If the user wants to add an 11th item, they must remove one first (swap rule, enforced by
code). Checklists are "frozen" when all items are done — logged as a `checklist_closed` event.

### 10. Friday Review

Structured end-of-week review. Energy rating, focus rating, outcome achievement per commitment.
The Review Agent synthesises the week, flags patterns, and drafts next Monday's plan.
The review is the input to next week's Planning Agent call.

### 11. Context-Aware AI Chat

A chat interface backed by the AI agents. The context package is loaded before every message.
All messages stored in `ai_messages`. AI responses include a confidence level. Proposed
changes go through `ai_actions` validation before any database write.

### 12. Communication Preferences Settings

User controls their check-in schedule (times, days), notification channels (email, WhatsApp),
and check-in intensity (light / standard / active). Settings stored in `notification_preferences`.

### 13. Polar Billing

Free, Solo, Pro, and Founder tiers. See `/docs/BILLING.md` for pricing.
Billing managed by Polar — no card data ever touches SoloChief servers.

---

## Phase 3 and Beyond

The following features are planned but not in MVP. Do not build them before Phase 1 is live
and in use.

| Feature | Description |
|---------|-------------|
| Attention Debt Score | Running score of how many high-permission commitments have been neglected |
| Pattern Detection Agent | Identifies recurrent slippage, context-switching habits, and under-prioritised areas |
| Capacity Planning | Models available focus hours vs. commitment load per week |
| Overwhelm Reset | Guided flow to triage commitments when the system detects overload |
| Decision Log | Structured record of significant commitment decisions and trade-offs |
| Weekly Scorecard | Visual summary of week performance across commitments |
| Templates and Modes | Pre-configured commitment sets for launch weeks, maintenance modes, etc. |

---

## Explicitly Not in MVP

See `/docs/MVP_SCOPE.md` for the full exclusion list.
