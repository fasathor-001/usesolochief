import type { ReactNode } from 'react'

interface ContextBlockProps {
  title?: string
  children: ReactNode
}

export function ContextBlock({ title, children }: ContextBlockProps) {
  return (
    <div className="sc-context-block">
      {title && <p className="sc-context-title">{title}</p>}
      {children}
    </div>
  )
}

interface ContextPanelProps {
  children: ReactNode
}

export function ContextPanel({ children }: ContextPanelProps) {
  return (
    <aside className="sc-context-panel">
      {children}
    </aside>
  )
}
