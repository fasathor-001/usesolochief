import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Terms of Service — SoloChief',
  description: 'The terms governing your use of SoloChief, operated by Astor Stack Technologies.',
}

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0F1B2D',
  color: '#94A3B8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container: React.CSSProperties = { maxWidth: 720, margin: '0 auto', padding: '80px 24px' }
const backLink: React.CSSProperties = { color: '#00C2A8', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 40 }
const titleStyle: React.CSSProperties = { color: '#FFFFFF', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }
const updatedStyle: React.CSSProperties = { color: '#94A3B8', fontSize: 13, marginTop: 8 }
const h2: React.CSSProperties = { color: '#00C2A8', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 40, marginBottom: 12 }
const p: React.CSSProperties = { color: '#94A3B8', fontSize: 16, lineHeight: 1.7, margin: '0 0 12px' }
const label: React.CSSProperties = { color: '#CBD5E1', fontSize: 15, fontWeight: 600, margin: '14px 0 6px' }
const ul: React.CSSProperties = { color: '#94A3B8', fontSize: 16, lineHeight: 1.7, paddingLeft: 22, margin: '0 0 12px' }
const li: React.CSSProperties = { marginBottom: 6 }
const teal: React.CSSProperties = { color: '#00C2A8', textDecoration: 'none' }
const footer: React.CSSProperties = { marginTop: 56, paddingTop: 24, borderTop: '1px solid #1E293B', display: 'flex', gap: 24, fontSize: 14 }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={h2}>{title}</h2>
      {children}
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={ul}>
      {items.map((t, i) => <li key={i} style={li}>{t}</li>)}
    </ul>
  )
}

export default function TermsOfServicePage() {
  return (
    <main style={wrap}>
      <div style={container}>
        <Link href="https://solochief.app" style={backLink}>← Back to SoloChief</Link>

        <h1 style={titleStyle}>Terms of Service</h1>
        <p style={updatedStyle}>Last updated: July 2026</p>

        <Section title="1 — Acceptance">
          <p style={p}>{"By creating an account or using SoloChief, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use SoloChief."}</p>
        </Section>

        <Section title="2 — Eligibility">
          <p style={p}>{"To use SoloChief you must:"}</p>
          <Bullets items={[
            "Be at least 18 years old",
            "Be the owner or authorised user of any WhatsApp number you connect",
            "Have the legal capacity to enter into this agreement",
          ]} />
        </Section>

        <Section title="3 — What SoloChief Is">
          <p style={p}>{"SoloChief is a productivity and operating system tool for founders, operators, builders, and professionals managing multiple commitments."}</p>
          <p style={label}>{"SoloChief provides:"}</p>
          <Bullets items={[
            "A web-based Command Center for planning and tracking",
            "An AI-powered WhatsApp assistant (Pocket Chief)",
            "Daily morning briefs and operational check-ins",
          ]} />
          <p style={label}>{"SoloChief is not:"}</p>
          <Bullets items={[
            "A substitute for professional, legal, or financial advice",
            "A guaranteed productivity system",
            "A general-purpose AI chatbot",
          ]} />
          <p style={p}>{"AI responses are generated to assist your operational decisions. You retain full responsibility for all decisions made."}</p>
        </Section>

        <Section title="4 — WhatsApp Usage">
          <p style={p}>{"SoloChief operates as a structured, purpose-specific assistant on WhatsApp Business API. By connecting your WhatsApp number:"}</p>
          <Bullets items={[
            "You consent to receive messages from SoloChief on WhatsApp including morning briefs, check-ins, and responses to your commands",
            "You confirm you own the WhatsApp number provided",
            "You understand that WhatsApp delivery is subject to Meta and Twilio platform availability",
            "You can withdraw consent and disconnect at any time from Settings → WhatsApp → Disconnect",
          ]} />
        </Section>

        <Section title="5 — Account">
          <Bullets items={[
            "One account per person",
            "You are responsible for keeping your login secure",
            "Do not share your account credentials",
            "You are responsible for all activity under your account",
            "Notify us immediately at hello@astorstack.com if you suspect unauthorised access",
          ]} />
        </Section>

        <Section title="6 — Subscriptions and Payments">
          <p style={label}>{"Free plan: No charge"}</p>
          <p style={label}>{"Pro plan: $15 per month"}</p>
          <p style={label}>{"Operator plan: $24 per month"}</p>
          <Bullets items={[
            "Payments are processed by Polar (polar.sh)",
            "Plans are billed monthly in advance",
            "No refunds on partial months already billed",
            "Cancel anytime from Settings → Billing",
            "On cancellation, access continues until end of the current billing period",
            "WhatsApp access pauses immediately on plan downgrade",
          ]} />
        </Section>

        <Section title="7 — Acceptable Use">
          <p style={p}>{"You agree not to:"}</p>
          <Bullets items={[
            "Use SoloChief for any unlawful purpose",
            "Send spam, harmful, or abusive content via Chief",
            "Attempt to reverse engineer, copy, or extract SoloChief's AI system prompts or proprietary logic",
            "Attempt to jailbreak, bypass, or override SoloChief's safety controls",
            "Use automated scripts or bots to interact with SoloChief beyond normal personal use",
            "Impersonate another person or provide false information",
            "Use SoloChief to harass, abuse, or harm others",
          ]} />
          <p style={p}>{"We reserve the right to suspend or terminate accounts that violate these terms without prior notice."}</p>
        </Section>

        <Section title="8 — Intellectual Property">
          <p style={p}>{"All branding, product features, design, and AI systems used in SoloChief are the intellectual property of Astor Stack Technologies (Pty) Ltd."}</p>
          <p style={p}>{"You retain ownership of all content you submit to SoloChief (your focus, commitments, follow-ups, notes). You grant us a limited licence to process this content solely for the purpose of operating SoloChief."}</p>
        </Section>

        <Section title="9 — Limitation of Liability">
          <p style={p}>{"SoloChief is provided as-is."}</p>
          <p style={p}>{"Astor Stack Technologies is not liable for:"}</p>
          <Bullets items={[
            "Missed follow-ups, lost commitments, or dropped tasks",
            "Business outcomes resulting from reliance on SoloChief or Chief's AI responses",
            "Service interruptions due to Twilio, Meta WhatsApp, Supabase, Anthropic, or Cloudflare availability",
            "Delays or errors in WhatsApp message delivery",
            "Data loss due to circumstances beyond our control",
          ]} />
          <p style={p}>{"Our total liability to you in any circumstance is limited to the amount you paid us in the 3 months prior to the claim."}</p>
        </Section>

        <Section title="10 — Termination">
          <p style={p}>{"You may delete your account at any time from Settings → Danger Zone → Delete account."}</p>
          <p style={p}>{"We may suspend or terminate your account if you:"}</p>
          <Bullets items={[
            "Violate these Terms",
            "Engage in fraudulent or abusive behaviour",
            "Are required to by law or regulation",
          ]} />
          <p style={p}>{"On termination, your data will be deleted within 30 days in accordance with our Privacy Policy."}</p>
        </Section>

        <Section title="11 — Changes to Terms">
          <p style={p}>{"We may update these Terms at any time. We will notify you via email or WhatsApp when material changes are made. Continued use after notification means you accept the updated Terms."}</p>
        </Section>

        <Section title="12 — Governing Law">
          <p style={p}>{"These Terms are governed by the laws of South Africa. Any disputes will be resolved under South African law."}</p>
        </Section>

        <Section title="13 — Contact">
          <p style={p}><a href="mailto:hello@astorstack.com" style={teal}>hello@astorstack.com</a></p>
          <p style={p}>{"Astor Stack Technologies (Pty) Ltd"}</p>
          <p style={p}>{"South Africa"}</p>
        </Section>

        <footer style={footer}>
          <Link href="/privacy" style={teal}>Privacy Policy</Link>
          <Link href="/terms" style={teal}>Terms of Service</Link>
        </footer>
      </div>
    </main>
  )
}
