import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  narrow?: boolean
  className?: string
}

export function PageShell({ children, narrow, className }: PageShellProps) {
  return (
    <div className={`sc-content ${narrow ? 'sc-page-container-narrow' : 'sc-page-container'}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
