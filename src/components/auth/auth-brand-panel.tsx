export default function AuthBrandPanel() {
  return (
    <div
      className="sc-auth-brand"
      style={{
        flex: '0 0 55%',
        background: '#0F1B2D',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#fff', letterSpacing: '-0.2px' }}>
          SoloChief <span style={{ color: '#00C2A8' }}>AI</span>
        </p>
      </div>

      <div>
        <h1 style={{
          margin: '0 0 20px',
          fontSize: '36px',
          fontWeight: 500,
          color: '#fff',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          maxWidth: '480px',
        }}>
          Your personal Chief of Staff for commitments, focus, and follow-ups.
        </h1>

        <p style={{
          margin: '0 0 40px',
          fontSize: '15px',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6,
          maxWidth: '420px',
        }}>
          For anyone managing commitments across work, study, life, and everything in between.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            'Choose what deserves attention today',
            'Park what can wait',
            'Keep follow-ups from slipping',
          ].map(line => (
            <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: '#00C2A8',
                flexShrink: 0,
              }} />
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6,
          fontStyle: 'italic',
          maxWidth: '400px',
        }}>
          &ldquo;Most productivity tools help you organise more work. SoloChief helps you decide what deserves attention &mdash; and what should wait.&rdquo;
        </p>
      </div>
    </div>
  )
}
