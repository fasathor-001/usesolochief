# Context Package

## Rule

The context package is loaded before every AI call — no exceptions (D-010).

An AI call without context produces generic advice. SoloChief's value is in specific,
personalised, commitment-aware responses. The context package is what makes that possible.

---

## What It Contains

The context package is a structured JSON object assembled from the database before each
AI agent call. It is pre-computed and stored in `context_snapshots` for performance.

```json
{
  "profile": {
    "name": "string",
    "timezone": "string",
    "planningStyle": "string | null"
  },
  "commitments": [
    {
      "id": "uuid",
      "title": "string",
      "category": "CommitmentCategory",
      "stage": "CommitmentStage",
      "permissionLevel": "PermissionLevel",
      "priority": 1,
      "nextAction": "string | null",
      "lastTouchedAt": "ISO timestamp | null",
      "recentLogs": [
        {
          "date": "YYYY-MM-DD",
          "status": "DailyLogStatus",
          "source": "StatusSource",
          "notes": "string | null"
        }
      ]
    }
  ],
  "currentWeek": {
    "weekStart": "YYYY-MM-DD",
    "theme": "string | null",
    "priorities": ["string"],
    "outcomes": [
      {
        "commitmentId": "uuid",
        "description": "string",
        "achieved": "boolean | null"
      }
    ],
    "stopList": ["string"],
    "lockedAt": "ISO timestamp | null"
  },
  "todayFocus": {
    "date": "YYYY-MM-DD",
    "commitments": [
      {
        "id": "uuid",
        "title": "string",
        "status": "DailyLogStatus"
      }
    ],
    "confirmed": false,
    "confirmedAt": "ISO timestamp | null"
  },
  "followUps": [
    {
      "id": "uuid",
      "title": "string",
      "dueDate": "YYYY-MM-DD | null",
      "daysOverdue": 0,
      "completedAt": "ISO timestamp | null"
    }
  ],
  "parkingLot": [
    {
      "id": "uuid",
      "title": "string",
      "parkedAt": "YYYY-MM-DD",
      "notes": "string | null"
    }
  ],
  "launchChecklists": [
    {
      "id": "uuid",
      "title": "string",
      "commitmentId": "uuid | null",
      "itemCount": 0,
      "doneCount": 0,
      "closedAt": "ISO timestamp | null"
    }
  ],
  "switchRequests": [
    {
      "id": "uuid",
      "fromCommitmentId": "uuid | null",
      "toCommitmentId": "uuid | null",
      "reason": "string | null",
      "decision": "SwitchDecision",
      "createdAt": "ISO timestamp"
    }
  ],
  "recentPatterns": {
    "slippageRate": 0.0,
    "unknownRate": 0.0,
    "switchCount": 0,
    "mostSwitchedFromId": "uuid | null",
    "mostNeglectedCategoryId": "string | null",
    "weeksOfData": 0
  },
  "lastReview": {
    "date": "YYYY-MM-DD | null",
    "energyRating": null,
    "focusRating": null,
    "summary": "string | null",
    "completedAt": "ISO timestamp | null"
  }
}
```

---

## Assembly Rules

### What gets included

- All non-deleted commitments for the user's workspace
- The current week's plan (week starting most recent Monday)
- Today's focus entries
- Follow-ups due within the next 14 days and all overdue items
- All parking lot items not yet reactivated
- All open launch checklists
- Switch requests from the current week
- Recent patterns calculated from the last 4 weeks of daily logs
- The most recent completed Friday review

### What gets excluded

- Completed follow-ups older than 14 days
- Closed launch checklists older than 30 days
- Daily logs older than 28 days (patterns only, not raw logs)
- Deleted commitments

### Pattern calculation

`recentPatterns` is calculated from the last 4 weeks of `daily_logs`:

- `slippageRate` = count(`slipped`) / total log entries
- `unknownRate` = count(`unknown`) / total log entries
- `switchCount` = count of `switch_requests` in last 4 weeks
- `mostSwitchedFromId` = most frequent `from_commitment_id` in switch requests
- `weeksOfData` = number of distinct weeks with any log entries

---

## Confidence Calculation

The context package includes an implicit confidence level used by agents:

| Condition | Confidence impact |
|-----------|------------------|
| Today's focus confirmed | +high |
| Today's focus not confirmed | -medium |
| `unknownRate` > 0.3 | -medium |
| `unknownRate` > 0.5 | -high |
| Last review missing | -low |
| Last review > 14 days ago | -low |
| Multiple switch requests this week | -low |
| Weekly plan not locked | -low |

Overall confidence = `high` if no negative signals; `medium` if 1–2; `low` if 3+.

---

## Caching

Context packages are stored in `context_snapshots`:
- One snapshot per user per day
- Regenerated on: focus confirmation, status update, commitment change, check-in completion
- The snapshot `payload` column holds the full JSON object
- Stale snapshots (> 6 hours old during active hours) are regenerated before AI calls

---

## Never Assume Completion from Silence

The context package must faithfully represent `unknown` statuses. It must not infer that
a commitment with no log entry today is `done` or `in_progress`. The raw unknown count
is passed to the agent so it can calibrate its confidence and ask rather than assume.
