# UX / UI

## Core Principle

The engine can be complex. The user experience must feel simple.

SoloChief has sophisticated logic underneath: permission levels, stage transitions, switch
challenges, context packages, confidence scoring. None of this complexity should surface
in the UI unless the user explicitly needs to see it. The default experience is calm, clear,
and decision-focused.

---

## Design Philosophy

**One question at a time.** The UI should never show the user more than one primary action
or decision per screen. Today Focus shows the focus. The switch challenge asks one question.
The planning screen asks for one week theme before moving on.

**No dashboards of numbers.** SoloChief is not an analytics tool. The home screen is not
a metrics dashboard. It is a command centre — it shows what matters today, not how many
tasks were completed last month.

**Earn complexity.** Advanced features (patterns, attention debt score, capacity planning)
are Phase 3. The Phase 1 UI should feel like a well-designed notebook, not a project
management platform.

---

## Layout System

### Sidebar (240px, Midnight Blue `#0F1B2D`)

Always visible on desktop. Contains:
- Product wordmark "SoloChief" (top)
- Navigation items with Lucide icons
- User avatar, name, email, sign-out (bottom)

Active item: teal accent (`#00C2A8`) background tint, white text.
Inactive items: 60% white text, no background.

### Main Content (`#F8F9FA` Off White background)

Full remaining width. Each page manages its own layout.
Pages have a consistent header: page title + subtitle + optional CTA button (right).

### Modals

Use shadcn `Dialog`. Max width 480px for single-column forms. Centred.
Modal backdrop is dark semi-transparent, not blurred.

### Cards

White surface (`#FFFFFF`), 1px border (`#E2E8F0`), `rounded-xl`, subtle shadow.
No decorative gradients. Information density over decoration.

---

## Navigation Items (in order)

| Icon | Label | Route |
|------|-------|-------|
| Home | Command Centre | `/dashboard` |
| Target | Today Focus | `/dashboard/today` |
| Layers | Commitments | `/dashboard/commitments` |
| Calendar | Weekly Plan | `/dashboard/weekly-plan` |
| CheckSquare | Launch Checklists | `/dashboard/launch-checklists` |
| Archive | Parking Lot | `/dashboard/parking-lot` |
| Bell | Follow-ups | `/dashboard/follow-ups` |
| RefreshCw | Friday Review | `/dashboard/review` |
| MessageCircle | AI Chat | `/dashboard/chat` |
| Settings | Settings | `/dashboard/settings` |

---

## Commitment Cards

Cards are the primary data unit throughout the UI. Every commitment card shows:
- Title (bold, dark text)
- Category badge (pill)
- Stage badge (coloured pill — see BRAND.md for stage colours)
- Permission level label (small, muted text below title)
- Next action (if set, italicised muted text)
- Last touched date (if set, right-aligned muted text)
- Three-dot menu for Edit / Change Stage / Change Permission / Delete

Cards do not show IDs, UUIDs, or internal metadata.

---

## Badges

Badges use tight padding, rounded-full, and uppercase text at 11px.

Stage badge colours: see `docs/BRAND.md`.

Category badge colours use lighter versions of the stage palette (10% opacity background
with full-saturation text colour).

---

## Forms

- Labels above inputs, not inside (placeholder text is supplementary, not the label)
- Required fields marked with `*` after the label
- Validation errors shown inline below the field, in `--color-error` red
- Submit button shows loading spinner, disabled during submission
- Success closes the modal and shows a toast (sonner)
- Error shows inline in the modal, does not close it

---

## Empty States

Every list or group must have an empty state. Empty states:
- Show a short explanation ("No commitments in this stage yet")
- Show a clear CTA where relevant ("+ Add Commitment")
- Never show a sad face emoji or motivational text

---

## Loading States

Every async data fetch has a skeleton loading state using shadcn `Skeleton`.
Skeleton placeholders match the approximate size of the content they replace.
No spinners on page-level loads — use skeletons.
Spinners are used only on button actions (submitting a form, triggering an AI call).

---

## Mobile

Phase 1 is desktop-first. The sidebar collapses on mobile (hamburger menu).
All forms and modals are scrollable on small screens.
Touch targets are minimum 44x44px.

No mobile-specific features in Phase 1. The web experience is sufficient.

---

## Accessibility

- Colour contrast meets WCAG AA for all text against its background
- All interactive elements are keyboard navigable
- Focus rings are visible (`--color-accent` teal)
- Form inputs have associated labels (not aria-label-only)
- Modals trap focus when open
- Toast notifications are announced to screen readers (sonner handles this)

---

## What the UI Does Not Do

- No confetti animations on task completion
- No streak counters or gamification
- No motivational copy on empty states
- No percentage progress bars on commitments (this is not a task manager)
- No colour-coding by urgency (that is what stage and permission levels are for)
