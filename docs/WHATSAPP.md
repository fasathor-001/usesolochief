# WhatsApp Integration

## Phase 2 Only

Do not build WhatsApp integration until Phase 1 web is live, in daily use, and the core
commitment/focus loop is working. The web command centre is the product. WhatsApp is the
habit layer that makes daily use effortless. Building WhatsApp before the web is stable
is building on sand.

---

## Platform

**Twilio WhatsApp Business API**

SoloChief uses Twilio to send and receive WhatsApp messages via the official Business API.
This requires a verified WhatsApp Business Account and an approved message template for
outbound notifications.

Phone numbers are stored in `whatsapp_connections` (schema ready since Phase 1).
Verified connections only — unverified numbers receive no messages.

---

## Routes to Build in Phase 2

| Route | Purpose |
|-------|---------|
| `POST /api/whatsapp/inbound` | Receive all inbound WhatsApp messages from Twilio webhook |
| `POST /api/whatsapp/send` | Internal API to send a WhatsApp message to a user |
| `POST /api/cron/daily-focus` | Send morning focus confirmation at scheduled time |
| `POST /api/cron/monday-plan` | Send Monday planning prompt |
| `POST /api/cron/friday-review` | Send Friday review prompt |
| `POST /api/cron/followup-check` | Check for overdue follow-ups and surface them |

All cron routes must be protected by a secret header — never publicly callable.
All routes validate the user's `whatsapp_connections.verified = true` before sending.

---

## Inbound Webhook Handler

The inbound route must:
1. Validate the Twilio webhook signature
2. Look up the user by phone number in `whatsapp_connections`
3. Parse the message text against the command set (see `/docs/COMMUNICATION.md`)
4. If command matched: execute the appropriate server action
5. If Natural Typing fallback: pass to AI with context package
6. If no match: ask for clarification
7. Log all messages to `ai_messages` with `role = 'user'`
8. Return `200 OK` to Twilio within 10 seconds (Twilio retries on timeout)

---

## Message Discipline

WhatsApp messages from SoloChief must follow this tone:

- Calm, direct, decision-forcing
- Never motivational ("You've got this!", "Great job!")
- Never verbose — one key question or action per message
- Never more than 3 proactive messages per day per user
- Quiet hours enforced: no messages between 9pm–6am (user local time)

**Examples of correct tone:**

> "Morning. SoloChief AI v1 is still today's main focus. Confirm or change?"

> "You haven't logged a status for Legal Admin today. Done, partial, or slipped?"

> "Follow-up with Alex about contract — due today. Done?"

**Examples of incorrect tone:**

> "Good morning! 🌟 Ready to crush it today? Your focus is SoloChief AI v1! Let's go! 💪"

---

## Platform Risk

WhatsApp Business API is subject to Meta's platform policies and can be restricted or
suspended without notice. This is a real risk for any product that depends on WhatsApp.

**Mitigation:**
- The web command centre is always the full-featured primary interface
- All user data lives in Postgres — no data is WhatsApp-only
- If WhatsApp access is suspended, the web interface continues to function completely
- Email notifications can replace WhatsApp check-ins as a fallback
- Users must be able to complete the full SoloChief workflow from the web alone

WhatsApp is the habit layer. It is not the product.

---

## WhatsApp Connection Setup (Phase 2 UX)

1. User enters their phone number in Settings
2. SoloChief sends a verification code via WhatsApp
3. User confirms the code in the web interface
4. `whatsapp_connections.verified` is set to `true`
5. WhatsApp check-ins are activated

The phone number is stored securely. It is never exposed to other users.
