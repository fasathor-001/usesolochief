import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id, onboarded_at')
        .eq('user_id', data.user.id)
        .single()

      if (!profile?.onboarded_at) {
        return NextResponse.redirect(`${appUrl}/onboarding`)
      }
      return NextResponse.redirect(`${appUrl}/dashboard`)
    }
  }

  return NextResponse.redirect(`${appUrl}/auth/login?error=auth_failed`)
}
