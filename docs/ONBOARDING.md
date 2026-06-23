# Onboarding

## Why Onboarding Matters

SoloChief lives or dies on whether the user can set up their commitments without feeling
overwhelmed. The commitment inventory is the brain — if it is empty or poorly configured,
every AI call, every weekly plan, and every today focus will be useless.

Onboarding is not a tutorial. It is the first real use of the product.

---

## First-Run Experience

The user arrives at onboarding after their first magic link login.
The onboarding page (`/onboarding`) must complete before the user can access `/dashboard`.

The experience has three steps. Each step is short. No step requires more than 2 minutes.

---

## Step 1 — "What are you managing right now?"

A single prompt:

> **What are you working on right now?**
> List the products, projects, obligations, and ideas you are responsible for.
> Don't overthink it. You can edit everything after.

Text area with soft placeholder:
```
SoloChief AI (building)
Client retainer — Acme Corp
Legal: register company
Content: launch newsletter
```

The user types freely. Each line is treated as a potential commitment.

After submitting, the system parses each line and presents them as draft commitment cards
with auto-suggested categories and stages. The user confirms or adjusts each one.

---

## Commitment Setup

After the free-text step, the user sees their draft commitments as cards.
Each card has:
- Title (editable)
- Category selector (auto-suggested, adjustable)
- Stage selector (auto-suggested based on wording, e.g. "building" → active; "register" → follow_up)
- Permission level (auto-suggested from stage, adjustable)

The user confirms or removes each card. They can add more.

Minimum to proceed: 1 confirmed commitment.
Recommended: 3–6 commitments (the system surfaces this range as a guide, not a limit).

---

## Templates / Presets

If the user does not want to type free-form, they can choose from a preset:

| Preset | Commitments included |
|--------|---------------------|
| **Building a product** | Main product (main_focus), Admin/legal (active), Content/marketing (active), Customer conversations (follow_up) |
| **Freelancer/consultant** | Client work (main_focus × 2), Business admin (active), Networking (maintenance), Proposals (follow_up) |
| **Multiple projects** | Project A (main_focus), Project B (active), Project C (maintenance), Admin (active), Content (parked) |

Presets populate the commitment cards with sensible defaults. The user edits from there.

---

## Step 2 — First Weekly Plan

After commitments are set up, the user is prompted to create their first weekly plan.

> **What's the most important thing this week?**
> Pick your main focus — the commitment that matters most right now.

The user selects 1–2 commitments as `main_focus` for this week.
They write a one-line week theme (optional):
> "Get the commitment inventory feature shipped."

The weekly plan is created and locked. This is the first real output SoloChief stores.

---

## Step 3 — First Today Focus

After the weekly plan, the user is shown the Today Focus screen for today.

> **What will you actually work on today?**
> Pick 1–3 commitments from your main focus.

The user selects and confirms. This triggers the first `focus_confirmations` record.
Onboarding is complete. The user lands on `/dashboard/today`.

---

## Sample Data

Onboarding does not use sample data or demo mode. The first commitments the user enters
are real. This is intentional:

- Sample data creates false familiarity with a fake context
- It must be deleted before real use, which is friction
- The free-text input ("What are you managing right now?") is fast enough that real data is easier

---

## How Quickly the User Reaches Value

| Time | What happens |
|------|-------------|
| 0:00 | Sign up via magic link |
| 0:02 | Email received, link clicked |
| 0:03 | Free-text commitment list entered |
| 0:05 | Draft commitments confirmed |
| 0:07 | First weekly plan created |
| 0:09 | Today focus confirmed |
| 0:10 | User is on the Today Focus screen with real commitments |

The first AI call happens when the user opens the AI Chat or the Planning Agent is invoked
for the Monday plan. The context package is already built from the onboarding data.

---

## After Onboarding

- The user can edit any commitment at any time from the Commitments page
- Commitments can be added, moved, parked, or deleted freely
- The onboarding flow is not repeatable — it runs once, marks `profiles.onboarded_at`
- If the user needs to start over, they delete all commitments and start the weekly plan fresh

---

## Onboarding Data Written

After completing onboarding, the database contains:

| Table | Records |
|-------|--------|
| `workspaces` | 1 (auto-created) |
| `profiles` | Updated with `onboarded_at`, `workspace_id` |
| `commitments` | User's confirmed commitments |
| `weekly_plans` | 1 (current week) |
| `daily_focus` | 1–3 for today |
| `focus_confirmations` | 1 (today confirmed) |
