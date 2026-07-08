import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/signup-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Redirect authenticated users to dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const errorParam = params?.error
  const error = typeof errorParam === 'string' ? errorParam : Array.isArray(errorParam) ? errorParam[0] : ''

  return <SignupForm initialError={error} />
}
