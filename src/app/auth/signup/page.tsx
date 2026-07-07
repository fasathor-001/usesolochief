import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Redirect authenticated users to dashboard
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    redirect('/dashboard')
  }

  const params = await searchParams
  // Log the full URL params
  console.log('FULL PARAMS:', JSON.stringify(params))
  const errorParam = params?.error
  const error = typeof errorParam === 'string' ? errorParam : Array.isArray(errorParam) ? errorParam[0] : ''
  console.log('FINAL ERROR STRING:', error)
  return <SignupForm initialError={error} />
}
