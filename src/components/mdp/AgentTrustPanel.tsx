import type { AgentMdpRow, AgentState } from '@/lib/mdp/types'
import { stateLabel } from '@/lib/mdp/types'

interface Props {
  states: AgentMdpRow[]
}

const AGENT_DISPLAY: Record<string, { label: string; description: string }> = {
  planning:  { label: 'Planning',  description: 'Weekly plan creation and outcome clarity' },
  focus:     { label: 'Focus',     description: 'Focus protection and switch challenge' },
  followup:  { label: 'Follow-up', description: 'Open loop tracking and resolution' },
  review:    { label: 'Review',    description: 'Weekly reflection and honest accounting' },
}

function stateBadgeStyle(state: AgentState): React.CSSProperties {
  switch (state) {
    case 'candidate': return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#475569' }
    case 'proving':   return { backgroundColor: 'rgba(245,158,11,0.12)',  color: '#92400E' }
    case 'valued':    return { backgroundColor: 'rgba(0,194,168,0.12)',   color: '#007A6A' }
    case 'void':      return { backgroundColor: 'rgba(239,68,68,0.12)',   color: '#991B1B' }
  }
}

function ProgressDots({ state }: { state: AgentState }) {
  const steps: AgentState[] = ['candidate', 'proving', 'valued']
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {steps.map(s => {
        const isActive  = s === state
        const isPast    = steps.indexOf(s) < steps.indexOf(state === 'void' ? 'candidate' : state)
        const isVoid    = state === 'void'
        return (
          <div
            key={s}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: isVoid
                ? '#EF4444'
                : isActive || isPast
                  ? '#00C2A8'
                  : 'var(--sc-border)',
              opacity: isPast ? 0.5 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

function AgentCard({ row }: { row: AgentMdpRow }) {
  const display = AGENT_DISPLAY[row.agent_name] ?? { label: row.agent_name, description: '' }
  const label   = stateLabel(row.state)

  const lastEval = row.last_evaluated_at
    ? new Date(row.last_evaluated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Not yet evaluated'

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 'var(--sc-r)',
      border: '0.5px solid var(--sc-border)',
      backgroundColor: 'var(--sc-bg)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--sc-text)', marginBottom: 2 }}>
            {display.label}
          </p>
          <p style={{ fontSize: 11, color: 'var(--sc-muted)' }}>{display.description}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 8px',
          borderRadius: 4, ...stateBadgeStyle(row.state),
        }}>
          {label}
        </span>
      </div>

      <ProgressDots state={row.state} />

      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Streak</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginTop: 1 }}>{row.correct_streak}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Evaluations</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginTop: 1 }}>{row.total_evaluations}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--sc-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last signal</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--sc-text)', marginTop: 1 }}>{lastEval}</p>
        </div>
      </div>
    </div>
  )
}

export function AgentTrustPanel({ states }: Props) {
  const agentOrder: AgentMdpRow['agent_name'][] = ['planning', 'focus', 'followup', 'review']

  if (states.length === 0) {
    return (
      <div style={{ padding: '20px 0', color: 'var(--sc-muted)', fontSize: 13 }}>
        Agent trust data is not yet available. It is seeded when you first complete a Friday Review.
      </div>
    )
  }

  const sorted = agentOrder
    .map(name => states.find(s => s.agent_name === name))
    .filter((s): s is AgentMdpRow => !!s)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(row => <AgentCard key={row.agent_name} row={row} />)}
      <p style={{ fontSize: 11, color: 'var(--sc-muted)', marginTop: 4 }}>
        Trust states are updated automatically after each Friday Review. Agents earn trust through useful outcomes and accurate suggestions.
      </p>
    </div>
  )
}
