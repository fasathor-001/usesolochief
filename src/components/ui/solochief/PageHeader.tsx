import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  secondaryAction?: ReactNode
}

export function PageHeader({ title, subtitle, action, secondaryAction }: PageHeaderProps) {
  return (
    <div className="sc-page-header">
      <div className="sc-page-header-left">
        <h1 className="sc-page-title">{title}</h1>
        {subtitle && <p className="sc-page-subtitle">{subtitle}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="sc-page-header-actions">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  )
}
