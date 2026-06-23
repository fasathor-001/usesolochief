import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sc-background)' }}>
      <div className="w-full max-w-md px-6 text-center">
        <div className="bg-white rounded-xl shadow-sm border p-8" style={{ borderColor: 'var(--sc-border)' }}>
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--sc-primary)' }}>
            Check your email
          </h1>
          <p className="mb-6" style={{ color: 'var(--sc-muted)' }}>
            We&apos;ve sent you a magic link. Click it to sign in — no password needed.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-medium underline"
            style={{ color: 'var(--sc-accent)' }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
