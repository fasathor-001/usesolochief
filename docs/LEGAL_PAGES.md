# Legal Pages

## Status

Full legal documents are not drafted here. This file specifies what each legal page must
cover when it is written by a lawyer or reviewed for accuracy. Do not publish legal pages
written entirely by AI without professional review.

---

## Privacy Policy

**URL:** `solochief.app/privacy`

Must cover:

- What personal data is collected (email address, name, timezone, commitment data, usage logs)
- Why it is collected (account management, AI personalisation, product improvement)
- Where it is stored (Supabase, hosted in [region]; Railway, hosted in [region])
- Who has access (only the authenticated user via RLS; Astor Stack for support purposes)
- Third-party processors: Supabase, Railway, Anthropic, Resend, Polar, Twilio (Phase 2)
- Data retention: account data retained for 30 days after account deletion
- User rights: right to export, right to deletion, right to correction
- Cookie policy: auth session cookies only, no tracking cookies in Phase 1
- Contact: fasathor@icloud.com

**GDPR note:** Even if the initial user base is South African, the product may have EU users.
GDPR compliance should be the baseline. South Africa's POPIA has similar requirements.

---

## Terms of Service

**URL:** `solochief.app/terms`

Must cover:

- What the service is and what it is not (not financial, legal, or medical advice)
- Acceptable use (no abuse, no automation without permission, no reselling access)
- Account responsibility (user is responsible for their account credentials)
- Billing terms (subscription, cancellation, refund policy)
- AI disclaimer (see below)
- Limitation of liability (SoloChief is not liable for business decisions made based on AI advice)
- Termination (Astor Stack may terminate accounts for abuse; user may delete account at any time)
- Governing law: [to be determined by legal review]

---

## AI Disclaimer

Must appear on the Terms of Service page and near the AI Chat interface:

> SoloChief AI provides suggestions, summaries, and planning support based on the information
> you provide. Its responses are not professional business, financial, legal, or medical advice.
> Do not rely on AI-generated content as the sole basis for significant decisions.
> AI outputs may be inaccurate or incomplete. Always apply your own judgement.

---

## WhatsApp Communication Consent

Required before activating WhatsApp in Phase 2.

Must cover:
- User explicitly consents to receive WhatsApp messages from SoloChief AI
- Maximum frequency (3 proactive messages per day)
- Quiet hours (9pm–6am user-local time)
- How to stop messages (reply STOP, or disconnect in Settings)
- No promotional or third-party messages will be sent via WhatsApp
- Message and data rates may apply (carrier-dependent)

Consent must be recorded as a timestamped field in `whatsapp_connections`.
Consent must be re-confirmed if the user changes their phone number.

---

## Data Deletion

**URL:** `solochief.app/account/delete` (behind auth)

Must cover on the deletion confirmation screen:

> Deleting your account will permanently remove all your commitments, plans, logs, and
> AI conversations. This cannot be undone. You will not be charged again after deletion.
> If you have a paid subscription, it will be cancelled immediately.

After deletion:
- All user rows are deleted (cascade via `auth.users` → all tables)
- Supabase Auth user record is deleted
- Polar subscription is cancelled via API
- Data may persist in Supabase backups for up to 30 days

---

## Contact and Support

**URL:** `solochief.app/support`

Must include:
- Support email: fasathor@icloud.com
- Response time expectation: 48 hours
- Link to SUPPORT documentation (if public)
- Bug report instructions

---

## Early Access Disclaimer

During early access (before public launch), the following must appear on the sign-up page
and in the welcome email:

> SoloChief AI is in early access. Features may change, and the service may be interrupted
> for maintenance without notice. Your feedback directly shapes the product.
> Thank you for being an early user.

The early access disclaimer is removed when the product reaches a stable public launch.
