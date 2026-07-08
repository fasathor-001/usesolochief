import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Privacy Policy — SoloChief',
  description: 'How SoloChief and Astor Stack Technologies collect, use, and protect your data.',
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

export default function PrivacyPolicyPage() {
  return (
    <main style={wrap}>
      <div style={container}>
        <Link href="https://solochief.app" style={backLink}>← Back to SoloChief</Link>

        <h1 style={titleStyle}>Privacy Policy</h1>
        <p style={updatedStyle}>Last updated: July 2026</p>

        <Section title="1 — Who We Are">
          <p style={p}>{"Astor Stack Technologies (Pty) Ltd operates SoloChief (solochief.app), an AI-powered productivity and operating system for founders and operators."}</p>
          <p style={p}>{"Contact: "}<a href="mailto:hello@astorstack.com" style={teal}>hello@astorstack.com</a></p>
          <p style={p}>{"Address: South Africa"}</p>
        </Section>

        <Section title="2 — What We Collect">
          <p style={p}>{"We collect the following information:"}</p>
          <p style={label}>{"Account information:"}</p>
          <Bullets items={[
            "Email address (required for account creation)",
            "Full name (optional, provided during onboarding)",
          ]} />
          <p style={label}>{"WhatsApp information (if you choose to connect):"}</p>
          <Bullets items={[
            "WhatsApp phone number",
            "Message content sent to and from SoloChief on WhatsApp",
            "Connection timestamps",
          ]} />
          <p style={label}>{"Usage data:"}</p>
          <Bullets items={[
            "Focus entries, commitments, follow-ups, weekly plans, parking lot items, and Friday review responses",
            "Login timestamps and session data",
            "Feature usage patterns (anonymised)",
          ]} />
          <p style={label}>{"Payment information:"}</p>
          <Bullets items={[
            "Payments are processed by Polar (polar.sh)",
            "We do not store card numbers or payment credentials",
            "We receive confirmation of subscription status only",
          ]} />
        </Section>

        <Section title="3 — How We Use Your Data">
          <p style={p}>{"We use your data to:"}</p>
          <Bullets items={[
            "Operate SoloChief and deliver your morning brief",
            "Send WhatsApp messages you have explicitly consented to",
            "Generate AI responses using your operational context",
            "Process your subscription and manage your account",
            "Improve the product based on anonymised usage patterns",
            "Communicate product updates and changes",
          ]} />
        </Section>

        <Section title="4 — AI and Your Data">
          <p style={p}>{"SoloChief uses Anthropic's Claude API to generate responses."}</p>
          <Bullets items={[
            "Your operational data (focus, commitments, follow-ups) is sent to Anthropic's API to generate contextual responses",
            "Anthropic does not use API customer data to train models",
            "AI responses are generated in real time and not stored by Anthropic beyond the immediate request",
            "AI responses may not always be fully accurate. SoloChief AI is an operational assistant, not a substitute for professional advice",
          ]} />
        </Section>

        <Section title="5 — WhatsApp and Your Data">
          <p style={p}>{"SoloChief uses Twilio and the WhatsApp Business API to deliver messages to your phone."}</p>
          <Bullets items={[
            "SoloChief is a structured, purpose-specific productivity assistant. It is not a general-purpose AI chatbot.",
            "WhatsApp messages are processed through Twilio's infrastructure in accordance with their privacy policy",
            "You consent to receive WhatsApp messages when you connect your number during onboarding or Settings",
            "You can disconnect at any time from Settings → WhatsApp → Disconnect",
          ]} />
        </Section>

        <Section title="6 — Data Sharing">
          <p style={p}>{"We share data only with the following service providers who process data on our behalf:"}</p>
          <Bullets items={[
            "Supabase — database and authentication (EU, eu-west-1)",
            "Twilio — WhatsApp message delivery",
            "Anthropic — AI response generation",
            "Polar — subscription and payment processing",
            "Resend — transactional email delivery",
          ]} />
          <p style={p}>{"We do not sell your data. We do not share your data with advertisers. We do not use your data for any purpose beyond operating SoloChief."}</p>
        </Section>

        <Section title="7 — Data Storage and Security">
          <Bullets items={[
            "All data is stored on Supabase infrastructure in the EU (eu-west-1 region)",
            "Authentication is handled by Supabase Auth (SOC 2 Type II certified)",
            "Passwords are hashed using bcrypt and never stored in plain text",
            "We use HTTPS for all data transmission",
            "Access to production data is strictly limited",
          ]} />
        </Section>

        <Section title="8 — Cookies">
          <p style={p}>{"SoloChief uses essential cookies only:"}</p>
          <Bullets items={[
            "Authentication session cookies (required to stay logged in)",
            "No advertising cookies",
            "No third-party tracking cookies",
          ]} />
        </Section>

        <Section title="9 — Data Retention">
          <Bullets items={[
            "Your data is retained while your account is active",
            "On account deletion, your personal data is permanently deleted within 30 days",
            "WhatsApp message logs are not retained beyond what is necessary to deliver the service",
            "Anonymised usage patterns may be retained for product improvement",
          ]} />
        </Section>

        <Section title="10 — Your Rights (GDPR)">
          <p style={p}>{"If you are in the European Economic Area or UK, you have the right to:"}</p>
          <Bullets items={[
            "Access your personal data",
            "Correct inaccurate data",
            "Request deletion of your data",
            "Withdraw consent at any time",
            "Lodge a complaint with your local data protection authority",
          ]} />
          <p style={p}>{"To exercise any right, contact: "}<a href="mailto:hello@astorstack.com" style={teal}>hello@astorstack.com</a></p>
        </Section>

        <Section title="11 — Children">
          <p style={p}>{"SoloChief is not intended for users under 18 years of age. We do not knowingly collect data from minors."}</p>
        </Section>

        <Section title="12 — Governing Law">
          <p style={p}>{"This policy is governed by the laws of South Africa and, where applicable, the General Data Protection Regulation (GDPR)."}</p>
        </Section>

        <Section title="13 — Changes">
          <p style={p}>{"We may update this policy. We will notify you via email or WhatsApp when material changes are made. Continued use after notification means acceptance."}</p>
        </Section>

        <Section title="14 — Contact">
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
