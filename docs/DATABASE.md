# Database

## Platform

Supabase (Postgres). RLS enabled on every table — no exceptions (D-007).
UUID primary keys throughout. Every table has `id`, `created_at`, `updated_at`.
Every table has `user_id` (references `auth.users`) and `workspace_id` (references `workspaces`).

## Enums

### CommitmentCategory
```
product | admin | legal | finance | content | customer | launch | maintenance | idea | personal
```

### CommitmentStage
```
main_focus | active | launch_checklist | maintenance | follow_up | parked
```

Stage order for display: main_focus → active → launch_checklist → maintenance → follow_up → parked

### PermissionLevel
```
can_interrupt | protected_block | checklist_only | maintenance_only | follow_up_only | parked
```

Auto-suggestion by stage:
```
main_focus       → can_interrupt
active           → protected_block
launch_checklist → checklist_only
maintenance      → maintenance_only
follow_up        → follow_up_only
parked           → parked
```

### DailyLogStatus (daily_log_status)
```
planned | confirmed | in_progress | done | partial | blocked |
slipped | switched | wrongly_touched | unknown | needs_review
```

`unknown` is a first-class status. Silence never equals completion (D-009).

### StatusSource (status_source)
```
user_whatsapp | user_web | user_corrected | system_inferred | ai_suggested | ai_confirmed
```

### AdviceConfidence (advice_confidence)
```
high | medium | low
```

### CheckInType (check_in_type)
```
morning_confirm | midday_check | end_day | friday_review
```

### SwitchDecision (switch_request_decision)
```
approved | blocked | pending
```

### CommitmentEventType (commitment_event_type)
```
stage_changed | permission_changed | wrongly_touched |
approved_switch | checklist_closed | parked | reactivated
```

## Tables (30 total)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `workspaces` | One workspace per user in Phase 1. Container for all user data. |
| 2 | `profiles` | Extended user profile: name, timezone, avatar, onboarded_at. |
| 3 | `commitment_categories` | User-defined category labels (colour, name, sort order). |
| 4 | `commitments` | Core table. Every product, project, obligation, and idea. |
| 5 | `commitment_events` | Immutable log of every stage/permission change on a commitment. |
| 6 | `weekly_plans` | One per week. Theme, priorities, locked state. |
| 7 | `weekly_outcomes` | Expected outcomes per weekly plan, linked to commitments. |
| 8 | `stop_list_items` | Things the user has explicitly decided not to do this week. |
| 9 | `daily_focus` | The 1–3 commitments selected as today's focus. |
| 10 | `not_today_items` | Blocked items for a specific day with reason. |
| 11 | `launch_checklists` | Pre-launch checklists linked to a commitment. Max 10 items. |
| 12 | `launch_checklist_items` | Individual checklist items. |
| 13 | `parking_lot_items` | Ideas and tasks parked for later, with trade-off tracking. |
| 14 | `followups` | Admin, legal, client, payment follow-ups with due dates. |
| 15 | `reviews` | Friday review records: energy rating, focus rating, summary. |
| 16 | `review_items` | Individual commitment outcomes reviewed in a Friday review. |
| 17 | `ai_messages` | All messages in AI chat threads (user + assistant). |
| 18 | `ai_actions` | AI-proposed changes awaiting validation before DB write. |
| 19 | `agent_runs` | Log of every AI agent invocation: input, output, tokens. |
| 20 | `switch_requests` | Logged challenge when user tries to switch commitment mid-week. |
| 21 | `check_ins` | Morning/midday/EOD/Friday check-in records. |
| 22 | `daily_logs` | Per-commitment daily status log with source and notes. |
| 23 | `blockers` | Explicit blockers on a commitment with resolution tracking. |
| 24 | `corrections` | User corrections to system-inferred values. Always available. |
| 25 | `context_snapshots` | Pre-computed context packages for AI calls. |
| 26 | `notification_preferences` | Per-user channel preferences and check-in schedule. |
| 27 | `notification_deliveries` | Delivery log for every notification sent. |
| 28 | `whatsapp_connections` | WhatsApp phone verification record (Phase 2 ready). |
| 29 | `work_logs` | Optional time-tracking per commitment. |
| 30 | `focus_confirmations` | Explicit confirmation that today's focus is accepted. |

## Key Relationships

```
auth.users
  └─ profiles (1:1)
  └─ workspaces (1:many, effectively 1:1 in Phase 1)

workspaces
  └─ commitments (1:many)
  └─ commitment_categories (1:many)
  └─ weekly_plans (1:many)
  └─ daily_focus (1:many)
  └─ followups (1:many)
  └─ parking_lot_items (1:many)
  └─ launch_checklists (1:many)

commitments
  └─ commitment_events (1:many) — immutable audit log
  └─ commitment_categories (many:1, optional)
  └─ daily_focus (1:many)
  └─ daily_logs (1:many)
  └─ review_items (1:many)

weekly_plans
  └─ weekly_outcomes (1:many)
  └─ reviews (1:many)

launch_checklists
  └─ launch_checklist_items (1:many)

daily_focus
  └─ focus_confirmations (1:many)
```

## RLS Policy Rules

Every table uses the same pattern:

```sql
alter table <table> enable row level security;

create policy "Users can manage their own <table>"
  on <table> for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

The service role key bypasses RLS. It must never be used client-side.
Client-side code uses the anon key — protected entirely by RLS.

## Index Strategy

Every table indexes:
- `user_id`
- `workspace_id`
- Date fields (`created_at`, `log_date`, `focus_date`, `week_start`, etc.)
- Status/stage fields where filtered often (`status`, `stage`, `decision`)

## The Unknown Rule

`daily_log_status` includes `unknown` as a first-class value.
A commitment with no status update for the day is not assumed to be `done` or `in_progress`.
It is `unknown`. This feeds into advice confidence scoring and the Friday review.
Silence never equals completion (D-009).
