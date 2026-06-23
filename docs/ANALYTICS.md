# Analytics

## Principle

Measure what tells you whether the product is working — not what is easy to measure.
SoloChief is not a pageview product. It is a daily-use behaviour product. The metrics
that matter are engagement depth and commitment loop completion, not traffic.

---

## Analytics Provider

Phase 1: lightweight, privacy-respecting analytics (e.g. Plausible or PostHog).
No Google Analytics. No third-party ad tracking.

Events are captured server-side where possible to avoid browser ad-blockers affecting data.

---

## Events to Track

### Acquisition

| Event | What it means |
|-------|--------------|
| `waitlist_signup` | Email captured on usesolochief.com |
| `account_created` | Magic link sign-up completed |
| `onboarding_started` | User reached /onboarding |
| `onboarding_completed` | User confirmed first today focus |

---

### Activation (first week)

| Event | What it means |
|-------|--------------|
| `first_commitment_created` | First real commitment added |
| `commitment_inventory_built` | 3+ commitments confirmed in onboarding |
| `first_weekly_plan_created` | Weekly plan created and locked |
| `first_today_focus_confirmed` | Today focus confirmed for the first time |
| `first_ai_chat_message` | User sent first message to AI |

---

### Engagement (ongoing)

| Event | What it means |
|-------|--------------|
| `daily_focus_confirmed` | User confirmed today's focus (core daily habit) |
| `commitment_status_updated` | Status logged (done / partial / blocked / etc.) |
| `switch_challenge_triggered` | User attempted to switch from declared focus |
| `switch_approved` | User provided reason and switched |
| `switch_blocked_by_user` | User decided not to switch after challenge |
| `parking_lot_item_added` | Idea captured to parking lot |
| `follow_up_completed` | Follow-up marked done |
| `weekly_plan_completed` | Week plan created and all outcomes reviewed |
| `friday_review_completed` | Friday review fully submitted |
| `checklist_item_completed` | Launch checklist item ticked off |
| `checklist_closed` | Full launch checklist closed |

---

### Retention Signals

| Event | What it means |
|-------|--------------|
| `day_7_active` | User logged at least 3 actions in days 1–7 |
| `day_14_active` | User completed at least 1 weekly plan and 1 Friday review |
| `day_30_active` | User has completed 4+ weekly loops |
| `commitment_edited` | User returned to adjust a commitment (signal of ongoing use) |

---

### Business

| Event | What it means |
|-------|--------------|
| `plan_upgrade_started` | User clicked upgrade button |
| `plan_upgraded` | Polar webhook confirmed upgrade |
| `plan_downgraded` | Polar webhook confirmed downgrade |
| `subscription_cancelled` | Polar webhook confirmed cancellation |
| `whatsapp_connected` | WhatsApp verified (Phase 2) |

---

## What Not to Track

- Individual page views as a success metric (vanity)
- Time on page (not indicative of SoloChief value)
- AI response character counts (not useful)
- User-specific content in event properties (commitment titles, notes — privacy)

---

## Key Questions Analytics Should Answer

1. Do users who complete onboarding return the next day?
2. Do users who create a weekly plan complete a Friday review?
3. How many daily focus confirmations does a typical active user make per week?
4. Is the switch challenge used and does it change user behaviour?
5. At what point do users churn — after first day, first week, or first month?
6. Which feature is missing from the daily loop? (inferred from where users stop)

---

## North Star Metric

**Daily Focus Confirmations per Active User per Week**

A user who confirms their focus 4–5 days out of 7 is using SoloChief as intended.
This metric captures daily habit formation, commitment loop completion, and product stickiness
in a single number.

Target for early access: 3+ confirmations/week for 70% of users who complete onboarding.
