import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--sc-background)' }}
    >
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--sc-primary)' }}>
        SoloChief
      </h1>
      <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--sc-muted)' }}>
        Your AI-powered command centre for solo founders and professionals who run on commitment.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--sc-accent)' }}
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="px-6 py-3 rounded-lg font-medium border transition-colors hover:bg-white"
          style={{ color: 'var(--sc-primary)', borderColor: 'var(--sc-border)' }}
        >
          Get started
        </Link>
      </div>
    </main>
  )
}
