import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { Suspense } from 'react'

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--sc-text)',
          marginBottom: 6,
          letterSpacing: '-0.3px',
        }}>
          Feedback
        </h1>
        <p style={{ fontSize: 14, color: 'var(--sc-muted)', lineHeight: 1.5 }}>
          Found a bug, have a feature idea, or something felt confusing? Let us know.
          We read every submission.
        </p>
      </div>

      <Suspense>
        <FeedbackForm />
      </Suspense>
    </div>
  )
}
