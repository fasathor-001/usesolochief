interface PagePlaceholderProps {
  title: string
  description?: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--sc-primary)' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--sc-muted)' }}>
          {description ?? 'Coming soon — building now'}
        </p>
      </div>
    </div>
  )
}
