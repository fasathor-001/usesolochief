# AI Agents

## Architecture

One `AIService` class. Four system prompts. All calls load the context package first — no exceptions (D-010).

```typescript
class AIService {
  async call(agentType: AgentType, userMessage: string, userId: string): Promise<AgentResponse>
}
```

The context package is assembled from the database, passed as the first part of every prompt.
The AI never receives a call without knowing the user's full current state.

## The Four Agents

### 1. Planning Agent

**When it runs:** Monday morning, or when user opens the weekly planning screen.

**What it does:**
- Reviews last week's outcomes (from Friday review)
- Looks at all active commitments and their stages
- Proposes this week's main focus (1–2 commitments maximum)
- Proposes weekly outcomes for each active commitment
- Identifies items that should be on the stop list this week
- Flags commitments that may be over-permissioned for current capacity

**Output format:**
- Proposed weekly plan (structured, awaits user confirmation)
- Stop list suggestions with reasoning
- Capacity warning if too many `main_focus` or `active` items

**Confidence gates:**
- Skips outcome suggestions if last week's data is `unknown` for more than 3 commitments
- Flags this to user instead of guessing

---

### 2. Focus Agent *(most important)*

**When it runs:** Morning check-in, switch requests, parking suggestions, not-today enforcement.

**What it does:**
- Challenges the user when they try to switch from their declared focus
- Enforces the not-today list
- Suggests parking items that keep surfacing but are not this week's focus
- Surfaces conflicts between what the user said mattered and what they are doing

**The switch challenge:**
When a user signals they want to work on something other than their declared focus:
1. Agent checks if the switch is within permission level
2. If not: challenges with specific reasoning ("You said X was main focus. Y is protected block. What changed?")
3. User must provide a reason to proceed
4. Reason is logged as a `switch_request` with outcome tracked at Friday review
5. Agent never blocks — it challenges, logs, and records

**Parking suggestions:**
If a commitment keeps being mentioned in notes but is not in this week's plan, the Focus Agent
suggests parking it explicitly rather than letting it become noise.

**Confidence gates:**
- High confidence: user has confirmed focus, no previous overrides this week
- Medium confidence: user has had one override or partial focus confirmation
- Low confidence: focus not confirmed, multiple unknown statuses, previous week had high slippage

---

### 3. Follow-up Agent

**When it runs:** Triggered by follow-up due dates, Friday review, or user query.

**What it does:**
- Tracks admin, legal, payment, and client follow-ups
- Surfaces overdue items without being nagging
- Groups follow-ups by type for efficient batching
- Suggests combining follow-ups into a single admin block

**Output format:**
- Overdue follow-up list with days overdue
- Suggested batch: "You have 3 finance follow-ups — handle them in one block"
- Completion prompt for items the user marked `done` but without a log

---

### 4. Review Agent

**When it runs:** Friday afternoon (or when user opens Friday review screen).

**What it does:**
- Synthesises the week: what was planned, what happened, what slipped
- Calculates outcome achievement rate
- Identifies patterns (e.g. "Legal admin has slipped 3 weeks in a row")
- Drafts next week's plan as a starting point
- Surfaces items that should move to parking lot or be stopped

**Output format:**
- Week summary (3–5 sentences)
- Outcome achievement by commitment
- Pattern flags (only if 2+ weeks of data available)
- Draft plan for next Monday
- Items recommended for parking lot

---

## Context Package Structure

The context package is a JSON object assembled from the database before every AI call.
It is stored in `context_snapshots` for performance and to avoid repeated DB queries mid-call.

```json
{
  "profile": {
    "name": "Frank",
    "timezone": "Africa/Johannesburg",
    "planningStyle": "structured"
  },
  "commitments": [
    {
      "id": "uuid",
      "title": "...",
      "category": "product",
      "stage": "main_focus",
      "permissionLevel": "can_interrupt",
      "priority": 1,
      "nextAction": "...",
      "lastTouchedAt": "2026-06-20T...",
      "recentLogs": [...]
    }
  ],
  "currentWeek": {
    "theme": "...",
    "priorities": [...],
    "outcomes": [...],
    "stopList": [...],
    "lockedAt": "..."
  },
  "todayFocus": {
    "date": "2026-06-23",
    "commitments": [...],
    "confirmed": true,
    "confirmedAt": "..."
  },
  "followUps": [...],
  "parkingLot": [...],
  "launchChecklists": [...],
  "switchRequests": [...],
  "recentPatterns": {
    "slippageRate": 0.2,
    "mostSwitchedFrom": "...",
    "unknownRate": 0.1
  },
  "lastReview": {
    "date": "2026-06-20",
    "energyRating": 3,
    "focusRating": 4,
    "summary": "..."
  }
}
```

## Advice Confidence

Every AI response carries a confidence level.

| Level | Condition |
|-------|-----------|
| `high` | Focus confirmed, no unknown statuses, plan locked, last review complete |
| `medium` | Partial confirmation, 1–2 unknowns, minor plan gaps |
| `low` | Focus unconfirmed, multiple unknowns, no last review, many slipped items |

When confidence is `low`, the AI states this explicitly and asks clarifying questions before
offering advice. It does not fabricate certainty from incomplete data.

## AI Proposes — System Validates — Database Writes

The AI never calls a Supabase write function directly. Every proposed change is:
1. Written to `ai_actions` with `status = 'proposed'`
2. Validated by server-side code against business rules
3. Applied to the target table with `status = 'applied'`

If validation fails, the action is set to `status = 'rejected'` and the rejection reason is logged.
This ensures no AI hallucination or bad output can corrupt the user's data.
