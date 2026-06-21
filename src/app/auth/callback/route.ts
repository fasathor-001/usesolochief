import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Workspace auto-creation and onboarding happen inside the dashboard layout
      return NextResponse.redirect(`${appUrl}/dashboard`)
    }
  }

  return NextResponse.redirect(`${appUrl}/auth/login?error=auth_failed`)
}
