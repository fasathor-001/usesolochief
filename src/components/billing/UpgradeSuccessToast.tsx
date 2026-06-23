'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function UpgradeSuccessToast({ plan }: { plan: string }) {
  const router = useRouter()

  useEffect(() => {
    const label = plan === 'pro' ? 'Pro' : plan === 'operator' ? 'Operator' : plan
    toast.success(`You are now on ${label}. Welcome to the full SoloChief experience.`, {
      duration: 6000,
    })
    // Remove ?upgraded=true from the URL without a full reload
    const url = new URL(window.location.href)
    url.searchParams.delete('upgraded')
    router.replace(url.pathname + url.search, { scroll: false })
  }, [plan, router])

  return null
}
