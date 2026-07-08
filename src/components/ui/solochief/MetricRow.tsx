interface MetricRowProps {
  label: string
  value: string | number
  variant?: 'default' | 'danger' | 'success'
}

export function MetricRow({ label, value, variant = 'default' }: MetricRowProps) {
  return (
    <div className="sc-metric-row">
      <span className="sc-metric-label">{label}</span>
      <span className={`sc-metric-value${variant !== 'default' ? ` ${variant}` : ''}`}>
        {value}
      </span>
    </div>
  )
}
