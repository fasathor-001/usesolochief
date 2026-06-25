import SigninForm from '@/components/auth/signin-form'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params?.error ?? ''

  return <SigninForm initialError={error} />
}
