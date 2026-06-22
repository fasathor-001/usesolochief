import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solochief.app'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const isRecovery =
        type === 'recovery' ||
        data.session.user?.recovery_sent_at != null ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.session as any).amr?.some((a: any) => a.method === 'recovery')

      if (isRecovery) {
        return NextResponse.redirect(`${appUrl}/auth/reset-password`)
      }

      return NextResponse.redirect(`${appUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${appUrl}/auth/login?error=auth_failed`)
}
