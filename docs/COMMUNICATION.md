# Communication

## Communication Modes

SoloChief supports three input modes for users interacting via WhatsApp (Phase 2):

| Mode | Description | Default? |
|------|-------------|----------|
| **Quick Tap** | Single-word commands from a fixed set | Yes |
| **Natural Typing** | Free-form sentences parsed by AI | Fallback |
| **Structured Form** | Web-only modal forms with field validation | Web only |

Default is Quick Tap. If input does not match a known command, Natural Typing fallback
is attempted. If parsing confidence is below 0.75, the system asks for clarification.

---

## Check-in Intensity

Users can set their check-in intensity in communication preferences:

| Intensity | Description |
|-----------|-------------|
| **Light** | Morning confirmation only. No midday. Brief EOD. |
| **Standard** *(default)* | Morning + optional midday + EOD + Friday review. |
| **Active** | Full schedule: morning + midday + EOD + follow-up nudges. |

---

## WhatsApp Command Set *(Phase 2)*

The command set is locked. Do not add new commands without a DECISIONS.md entry.

### Status Commands

| Command | Meaning |
|---------|---------|
| `confirm` | Today's focus is confirmed — starting as planned |
| `change` | Today's focus has changed — triggers switch challenge |
| `done` | Declared focus commitment is done for today |
| `partial:[note]` | Partially done — note is required |
| `blocked:[note]` | Blocked — note is required |
| `slipped` | Did not work on focus today |
| `switched:[note]` | Switched to a different commitment — note required |

### Capture Commands

| Command | Meaning |
|---------|---------|
| `park:[idea]` | Send idea to parking lot immediately |
| `fu:[task] [date]` | Add a follow-up with optional due date |
| `log:[note]` | Add a free-form note to today's log |

### Query Commands

| Command | Meaning |
|---------|---------|
| `today` | Show today's focus commitments and status |
| `status` | Show current week plan summary |
| `week` | Show full weekly plan |
| `parking` | Show parking lot items |
| `followups` | Show outstanding follow-ups |

### Review Commands

| Command | Meaning |
|---------|---------|
| `review` | Trigger Friday review flow |
| `plan` | Show or start Monday planning flow |

### Correction Commands

| Command | Meaning |
|---------|---------|
| `undo` | Undo last status update |
| `correct that` | Override last AI-logged status |
| `wrong` | Mark last status as incorrect and prompt re-entry |

Correction commands are always available, at any time, in any check-in flow.

---

## Check-in Schedule *(Phase 2)*

| Check-in | Default time | Adjustable? |
|----------|-------------|-------------|
| Morning confirm | 06:30 AM | Yes, per user timezone |
| Midday check | 12:00 PM | Optional, on by default in Standard |
| EOD debrief | 06:00 PM | Yes, per user timezone |
| Friday review | 03:00 PM Friday | Yes |

All times are localised to the user's timezone (stored in `profiles.timezone`).

### Message Discipline Rules

- Maximum 3 proactive WhatsApp messages per day per user
- Quiet hours enforced: no messages sent between 9pm and 6am user-local time
- Morning nudge sent only once (at 9am) if no confirmation by then
- No motivational language, no exclamation marks, no "You've got this!"
- Messages are calm, direct, decision-forcing

---

## Silence Handling

If the user does not confirm by 9am:

1. System sends a single nudge: "You haven't confirmed today's focus. Still on track?"
2. No further messages until the next scheduled check-in
3. Today's focus is logged as `unknown` in `daily_logs`
4. Check-in is marked incomplete in `check_ins`

Silence never equals completion (D-009).

---

## Correction Flow

Available at any time. No time limit on corrections.

1. User sends `undo`, `correct that`, or `wrong`
2. System shows the last status update with timestamp and source
3. User sends the correct value
4. Original value stored in `corrections` table with `source = user_corrected`
5. Updated value applied to `daily_logs`
6. AI context package refreshed

---

## Web Interface Communication

On the web, the same status updates are available via form controls and buttons.
Web-originated updates use `source = user_web` in `status_source`.
There are no WhatsApp-only statuses — the web interface supports the full command set.
