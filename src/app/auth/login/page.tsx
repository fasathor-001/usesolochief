import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import SigninForm from '@/components/auth/signin-form'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Redirect authenticated users to dashboard
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const errorParam = params?.error
  const error = typeof errorParam === 'string' ? errorParam : Array.isArray(errorParam) ? errorParam[0] : ''

  return <SigninForm initialError={error} />
}
