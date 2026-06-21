# Rules Engine

## Principle

Business rules are enforced by server-side code — not by AI judgement.

The AI can suggest, challenge, and advise. The rules engine can block. These are separate
systems and must never be conflated. If a rule is violated, the server returns an error before
any database write occurs. The AI is consulted after rules are checked, not instead of them.

---

## The Rules

### Rule 1 — One Weekly Override Maximum

A user may override their declared weekly plan (add a new main focus commitment or change the
week theme) once per week after the plan is locked. A second override in the same week requires
an explicit unlock with a reason. The reason is logged.

**Enforced by:** `updateWeeklyPlan` server action  
**Logged in:** `commitment_events` with `event_type = 'stage_changed'`

---

### Rule 2 — Launch Checklist Frozen at 10 Items (Swap Rule)

A launch checklist cannot have more than 10 items. If the user adds an 11th item, the server
returns an error. The user must remove an existing item before adding the new one. This is
the swap rule — it forces prioritisation within the checklist itself.

**Enforced by:** `addChecklistItem` server action  
**Error message:** "This checklist is full (10/10). Remove an item before adding another."

---

### Rule 3 — No New Commitment Midweek Without Capacity Check

Adding a new commitment with stage `main_focus` or `active` after Monday requires a capacity
check. The server counts current active commitments. If the user already has 2 in `main_focus`
or more than 6 in total active/main_focus stages, the action is flagged. The user can override
with a reason — the override and reason are logged.

**Enforced by:** `createCommitment` server action  
**Logged in:** `commitment_events`

---

### Rule 4 — Parking Lot Entry Requires Outcome Trade-Off

When the user moves a parking lot item into the active week, they must acknowledge what changes.
The server prompts: "Which active commitment will receive less attention to make room for this?"
The answer is logged in `parking_lot_items.notes`. The trade-off is surfaced in the Friday review.

**Enforced by:** `reactivateParkingLotItem` server action

---

### Rule 5 — Stop List Items Always Flagged if Touched

If a commitment or task appears on the stop list and the user creates a log entry or daily focus
item for it, the system flags it as `wrongly_touched`. This is logged as a `commitment_event`
and surfaced in the next AI call and in the Friday review. It is never silently allowed.

**Enforced by:** `createDailyFocus` and `createDailyLog` server actions  
**Logged in:** `commitment_events` with `event_type = 'wrongly_touched'`

---

### Rule 6 — No Same-Day Plan Changes Without Override Reason

After the morning confirmation check-in, the today focus list is locked. Changes to today's
focus require an explicit reason. The reason is logged with the change. This prevents
impulsive switching from being invisible in the data.

**Enforced by:** `updateDailyFocus` server action  
**Logged in:** `corrections`

---

### Rule 7 — No Outcome Marked Done Without Focus Confirmed First

A commitment's daily log cannot be set to `done` if today's focus confirmation has not been
completed. The server checks `focus_confirmations` for today before writing `done` to
`daily_logs`. If no confirmation exists, the user is prompted to confirm today's focus first.

**Enforced by:** `updateDailyLog` server action

---

### Rule 8 — Unknown is a First-Class Status

A commitment with no status update for the day is not assumed to be `done`, `in_progress`,
or anything else. Its status is `unknown`. Systems that default to "no news is good news"
produce bad AI advice. Unknown feeds into confidence scoring and the Friday review.

**Enforced by:** `daily_logs` default value  
**Reflected in:** advice confidence calculation, Friday Review Agent, context package

---

### Rule 9 — No Response Equals No Update Equals Stale Context Equals Bad Advice

If a user does not respond to a morning check-in by 9am, the system:
1. Logs today's focus as `unknown`
2. Sends a single nudge (WhatsApp, Phase 2 only)
3. Does not assume completion
4. Marks the check-in as incomplete in the `check_ins` table

This rule is the operational expression of D-009.

---

### Rule 10 — AI Proposes, System Validates, Database Writes

The AI never calls a database write function directly. Every AI-proposed change:
1. Is written to `ai_actions` with `status = 'proposed'`
2. Goes through server-side validation
3. Is applied to the target table only after validation passes

This rule is D-008 and cannot be bypassed.
