# Billing

## Payment Provider

**Polar** (polar.sh)

SoloChief uses Polar for subscription management, payment processing, and invoice generation.
No card data ever touches SoloChief servers. All billing is handled by Polar.

---

## Plans

| Plan | Price | Commitments | Features |
|------|-------|-------------|----------|
| **Free** | $0/month | 3 maximum | Web only. No AI. Weekly plan limited to 1 outcome. |
| **Solo** | $15/month | Unlimited | All web features. AI chat. AI Planning + Review agents. |
| **Pro** | $24/month | Unlimited | Everything in Solo + WhatsApp Chief of Staff (Phase 2). Focus + Follow-up agents. |
| **Founder** | $39/month | Unlimited | Everything in Pro + Pattern detection (Phase 3) + Priority support. |

All prices in USD. Billed monthly. No annual plan at launch.

---

## Pricing Rationale

Confirmed June 2026 after competitor research.

| Competitor | Price |
|------------|-------|
| Sunsama | $20–$25/month |
| Motion | $29–$49/month |
| Reclaim.ai | $10–$20/month |

SoloChief is positioned below Sunsama and Motion. AI features are gated at Solo and above
to protect margins — the Free plan demonstrates the commitment management system without
the AI layer.

---

## WhatsApp and Plan Gating

WhatsApp check-ins (Phase 2) are only available on Pro and Founder.

WhatsApp messages have a per-message cost via Twilio. This cost cannot be absorbed on the
Free or Solo plans. Pro pricing accounts for typical WhatsApp message volume (est. 3–5
outbound messages per active day per user).

---

## Billing Integration Points

- Polar webhook → `/api/billing/webhook` — handles subscription changes, upgrades, cancellations
- Polar customer portal link in Settings → Billing
- Feature gating enforced server-side by checking subscription status from Polar
- No feature gating enforced client-side only — always check on server

---

## What Billing Does Not Cover

- Data export (always available regardless of plan)
- Account deletion (always available regardless of plan)
- Support (available via email on all plans)

---

## Refunds

Refund requests are handled manually via the support email.
See `/docs/SUPPORT.md` for the process.
