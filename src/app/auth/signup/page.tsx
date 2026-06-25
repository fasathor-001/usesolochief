import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  // Log the full URL params
  console.log('FULL PARAMS:', JSON.stringify(params))
  const errorParam = params?.error
  const error = typeof errorParam === 'string' ? errorParam : Array.isArray(errorParam) ? errorParam[0] : ''
  console.log('FINAL ERROR STRING:', error)
  return <SignupForm initialError={error} />
}
