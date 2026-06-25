import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  console.log('searchParams params:', params)
  console.log('typeof params:', typeof params)
  const errorParam = params?.error
  console.log('errorParam:', errorParam)
  console.log('typeof errorParam:', typeof errorParam)
  const error = typeof errorParam === 'string' ? errorParam : Array.isArray(errorParam) ? errorParam[0] : ''

  return <SignupForm initialError={error} />
}
