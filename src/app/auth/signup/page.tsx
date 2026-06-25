import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params?.error ?? ''

  return <SignupForm initialError={error} />
}
