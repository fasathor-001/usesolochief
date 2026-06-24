With a button to reconnect or verify the number.

Do not notify the user via WhatsApp about a WhatsApp failure — use in-app notice only.

---

## 17. Message Quality Rules

Every SoloChief WhatsApp message must pass these rules:

1. **One action per message** — never give the user two things to decide
2. **Maximum 5 lines of text** — if longer, split into two messages
3. **Buttons before text input** — always offer buttons when a structured choice exists
4. **No guilt language** — never say "you haven't done X" or "you're falling behind"
5. **No AI waffle** — no "Great question!" or "I understand that..."
6. **Always move forward** — every message ends with a clear next step
7. **Quiet hours respected** — no messages after user's quiet hours (default 20:00 local time)
8. **Maximum 2 proactive messages per day** — morning briefing and one nudge
9. **No marketing in operational messages** — never mention upgrades in a briefing or nudge
10. **Plain language** — write like a calm, direct Chief of Staff, not a bot
11. **Unknown inputs handled gracefully** — always offer clarification buttons, never hallucinate
12. **Session rules respected** — free-form messages inside session window only; approved templates outside

---

## 18. Web and WhatsApp Sync Standard

SoloChief operates as one brain across two surfaces.

| Created in | Must appear in |
|-----------|---------------|
| WhatsApp capture | Web parking lot |
| WhatsApp follow-up | Web follow-ups |
| WhatsApp focus set | Web today focus |
| WhatsApp plan | Web weekly plan |
| WhatsApp review | Web Friday review |
| Web commitment | WhatsApp briefing |
| Web follow-up | WhatsApp nudge |
| Web weekly plan | WhatsApp morning briefing |
| Web Friday review | WhatsApp review prompt |

**Supabase is the single source of truth.** WhatsApp is an input/output surface. SoloChief must never store operational state inside Twilio payloads, message history, or WhatsApp session data. All state is written to and read from Supabase immediately.

---

## 19. Localisation Readiness

The first version of SoloChief WhatsApp is English-only.

However, all WhatsApp copy must be built with localisation in mind:

- All message copy must live in a message template layer — not hardcoded inside route handlers or server actions
- Template keys should be named clearly: `whatsapp.briefing.morning`, `whatsapp.onboarding.step1`, etc.
- No language-specific logic inside handlers — handlers call template functions, templates return copy
- Date and time formatting must use locale-aware formatting from day one
- Timezone handling must be per-user, not server-default

When localisation is added in a future version, only the template layer changes — no handler rewrites required.

---

## 20. Trust and Security Copy Standards

All consent and security language must be honest and plain.

Approved:
- "Your data is used only to support your operating rhythm."
- "You can pause or stop WhatsApp at any time."
- "SoloChief will not message you after your quiet hours."
- "You can type 'stop' at any time to stop all messages immediately."

Never use:
- "Military-grade encryption" — vague and unverifiable
- "Your data is 100% safe" — cannot be guaranteed
- "We never share your data" — unless legally verified and accurate

---

## 21. Implementation Requirements

This standard requires WhatsApp Business API with approved sender — not Twilio sandbox.

### Prerequisites before implementation

1. Twilio compliance profile approved
2. WhatsApp Business sender registered and approved by Meta
3. Meta-approved message templates created for:
   - First contact and welcome
   - Trust and consent screen
   - Morning briefing
   - Switch Challenge
   - Follow-up nudge
   - Friday Review prompt
   - Onboarding resume reminder
   - Stop confirmation
   - Pause confirmation
4. Interactive message support via Twilio Content API (buttons, list messages)
5. Onboarding state machine in Supabase — tracks step, progress, and consent per user
6. Timezone-aware delivery — check user timezone before every proactive send
7. Quiet hours enforcement per user
8. Message template layer — all copy in template functions, not hardcoded in handlers
9. Delivery failure tracking in `whatsapp_logs` with retry logic

### Migrations required

`supabase/migrations/014_whatsapp_onboarding_state.sql`

Table: `whatsapp_onboarding_states`
- `user_id` — references auth.users
- `step` — current onboarding step (1–5)
- `work_mode` — selected work mode
- `primary_need` — selected primary need
- `briefing_time` — selected briefing time
- `main_focus` — text
- `stop_list` — text
- `consent_given_at` — timestamp
- `completed_at` — timestamp
- `reminder_sent_at` — timestamp

### Cron updates required

- Morning briefing fires at user's selected briefing time in their timezone
- Nudges respect quiet hours per user
- Onboarding reminder fires 24 hours after incomplete onboarding
- Failure check runs daily — flags users with 3+ consecutive failures

---

## 22. Acceptance Criteria

SoloChief WhatsApp meets this standard when:

- New user receives a structured, button-led onboarding flow
- Consent screen appears before any data collection
- Onboarding progress is saved to Supabase after every step
- Incomplete onboarding sends one gentle reminder after 24 hours
- Morning briefing uses approved template and includes action buttons
- Switch Challenge uses buttons and is triggered by correct sources only
- Follow-up nudges use buttons for resolution
- Friday Review is guided through buttons
- Unknown messages receive clarification buttons — never a hallucinated reply
- Button fallback uses numbered replies when buttons unavailable
- Quiet hours are enforced per user timezone
- Session window rules are respected — free-form inside window, templates outside
- Stop command stops immediately with one confirmation — no dark patterns
- Pause command pauses immediately with one confirmation
- Delivery failures are logged, retried once, then marked final
- Tier 1 failures fall back to email — Tier 2 failures are logged and skipped
- 3+ consecutive failures trigger in-app disconnection notice
- All WhatsApp copy lives in a template layer — nothing hardcoded in handlers
- Any item created in WhatsApp appears in the web Command Centre
- Any item created on web is available in WhatsApp
- All state is written to and read from Supabase — never from Twilio or message history
- No message exceeds 5 lines without a clear reason
- No guilt language appears in any message
- Every message ends with one clear next step

---

## 23. The Competitive Standard

SoloChief WhatsApp must be better than existing WhatsApp AI products.

The advantage:
- The use case is perfect — daily planning, focus, follow-ups, and review map exactly to WhatsApp's strengths
- The audience is global — solo operators, consultants, founders, and creators who work from their phones
- The product already has the data — commitments, follow-ups, weekly plans, and Friday Reviews all live in Supabase
- The web app and WhatsApp are one system — not two separate tools
- The weekly operating system behind WhatsApp makes SoloChief structurally stronger than any standalone WhatsApp AI product

When this standard is fully implemented, SoloChief WhatsApp will be positioned to become the most structured and operationally useful productivity assistant on WhatsApp globally.

---

*SoloChief AI — WhatsApp Chief of Staff Standard v1.2*
*Prepared by Astor Stack Technologies*
*Owner: Frank A.*
*UK spelling throughout*