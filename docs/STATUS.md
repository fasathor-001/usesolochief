# Status System

## Daily Log Status

Every commitment's daily log entry carries one of these status values:

| Status | Meaning |
|--------|---------|
| `planned` | In today's focus, not yet started |
| `confirmed` | User confirmed this is today's focus |
| `in_progress` | Actively being worked on |
| `done` | Completed for today |
| `partial` | Worked on but not completed — note required |
| `blocked` | Cannot proceed — note required explaining blocker |
| `slipped` | Did not work on it today — no explicit blocker |
| `switched` | User switched to a different commitment — note required |
| `wrongly_touched` | User worked on a stop-list or restricted item |
| `unknown` | No status update received — **first-class status** |
| `needs_review` | System flagged for Friday review — pattern detected |

### The Unknown Rule

`unknown` is not a fallback or error state. It is a valid, deliberate status.

A commitment with status `unknown` means: "We do not know what happened today."
This is honest. Systems that infer completion from silence produce bad AI advice and
dishonest weekly reviews. SoloChief never infers `done` from no update (D-009).

`unknown` statuses:
- Lower advice confidence for that commitment
- Are counted in the Friday review slippage/unknown rate
- Trigger the AI to ask rather than assume
- Never auto-resolve at midnight to another status

---

## Status Source

Every status value records how it was set:

| Source | Meaning |
|--------|---------|
| `user_whatsapp` | User sent a command via WhatsApp |
| `user_web` | User updated via the web interface |
| `user_corrected` | User used the correction flow to override a previous value |
| `system_inferred` | System set this based on rules (e.g. midnight default to `unknown`) |
| `ai_suggested` | AI proposed this status — awaiting validation |
| `ai_confirmed` | AI proposal was validated and applied |

Source is stored in `daily_logs.status_source` and in `corrections.source`.

---

## Advice Confidence

Every AI response carries a `confidence` field:

| Level | Conditions |
|-------|------------|
| `high` | Focus confirmed today, no unknown statuses for active commitments, weekly plan locked, last Friday review complete |
| `medium` | Focus partially confirmed, 1–2 unknown statuses, minor plan gaps, or one previous override this week |
| `low` | Focus not confirmed, 3+ unknown statuses, no Friday review last week, or high slippage rate |

When confidence is `low`, the AI:
- States its confidence level explicitly
- Asks clarifying questions before offering advice
- Does not suggest changes to the weekly plan

The confidence threshold for acting without clarification is **0.75**.
Below this threshold, the AI asks rather than assumes.

---

## Correction Flow

The correction flow is available at any time in any interface. It has no time limit.

### Triggering corrections

- WhatsApp: `undo`, `correct that`, `wrong`
- Web: "Correct this" button on any daily log entry

### What happens

1. System retrieves the last status entry with its source and timestamp
2. User provides the correct value
3. Original entry is preserved — it is never deleted
4. A new `corrections` record is created:
   - `target_table = 'daily_logs'`
   - `target_id = <log id>`
   - `field_name = 'status'`
   - `old_value = <original status>`
   - `new_value = <corrected status>`
   - `source = 'user_corrected'`
5. The `daily_logs` record is updated with the corrected value
6. The context package for the next AI call includes the correction

### Why corrections are preserved

The correction log is part of the pattern data. If the AI keeps inferring incorrect statuses,
the correction pattern tells us the inference rules need adjusting. Deleting corrections would
hide this signal.

---

## Clarification Rule

If the AI receives a message or status update where confidence is below 0.75:

- The AI does **not** proceed with a best-guess interpretation
- The AI asks a single, specific clarifying question
- The question is logged in `ai_messages` with `role = 'assistant'`
- The conversation thread is preserved until the user answers
- Only after clarification does the AI proceed

This prevents confident wrong advice from bad inputs.
