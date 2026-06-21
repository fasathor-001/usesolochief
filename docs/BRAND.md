# Brand

## Identity

| Field | Value |
|-------|-------|
| Product name | SoloChief AI |
| Full name | SoloChief AI by Astor Stack |
| Parent company | Astor Stack Technologies |
| X (Twitter) | @solochiefai |
| GitHub | fasathor-001/solochief-ai |

---

## Colour Tokens

These are the canonical colour values for SoloChief AI. Use CSS custom properties throughout.

```css
--color-primary:    #0F1B2D  /* Midnight Blue — sidebar, headings, primary text */
--color-accent:     #00C2A8  /* Electric Teal — CTAs, active states, highlights */
--color-background: #F8F9FA  /* Off White — page background */
--color-surface:    #FFFFFF  /* White — cards, modals, panels */
--color-text:       #0D0D0D  /* Near Black — body text */
--color-muted:      #64748B  /* Slate Grey — secondary text, placeholders */
--color-border:     #E2E8F0  /* Light grey border */
--color-success:    #10B981  /* Green */
--color-warning:    #F59E0B  /* Amber */
--color-error:      #EF4444  /* Red */
```

These tokens are defined in `src/app/globals.css` as `--sc-*` properties.

---

## Stage Badge Colours

Used on commitment cards throughout the UI:

| Stage | Background | Use |
|-------|-----------|-----|
| `main_focus` | `#00C2A8` Electric Teal | |
| `active` | `#3B82F6` Blue | |
| `launch_checklist` | `#F59E0B` Amber | |
| `maintenance` | `#64748B` Slate | |
| `follow_up` | `#8B5CF6` Purple | |
| `parked` | `#374151` Dark Grey | |

---

## Tone of Voice

**Direct.** SoloChief speaks plainly. It does not pad sentences.

**Calm.** No urgency theatre. No "Don't miss this!" No countdown timers.

**Honest.** SoloChief tells you what it does not know. It does not pretend to have data it does not have.

**Respectful.** The user is a founder running a real business. SoloChief is not a coach, not a cheerleader, not a gamification engine. It is a chief of staff.

---

## Copy Rules

- UK spelling throughout all copy and code comments (D-005)
  - colour, centre, organisation, behaviour, licence, recognised, prioritise
- No exclamation marks in product copy
- No emoji in product copy (UI buttons, headers, error messages)
- No "AI magic" — describe what the system does, not a mystical effect
- No overexplaining the AI engine publicly — users care about outcomes, not architecture
- Avoid: "powerful", "seamless", "game-changing", "next-level", "supercharge"
- Use: "clear", "focused", "deliberate", "honest", "direct"

---

## Commit and Code Rules

- UK spelling in all code comments
- No Co-Authored-By trailer on any commit (D-006)
- Author on all commits: Frank A. \<fasathor@gmail.com\>
- Commit format: `feat: [what was built]`
- DECISIONS.md is append-only — never edit existing entries
