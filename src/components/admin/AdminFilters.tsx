'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

interface Props {
  planOptions: { value: string; label: string }[]
  defaultSearch?: string
  defaultPlan?: string
  placeholder?: string
}

export function AdminFilters({ planOptions, defaultSearch, defaultPlan, placeholder }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset to page 1 when filter changes
      router.push('?' + params.toString())
    },
    [router, searchParams],
  )

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sc-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder={placeholder ?? 'Search…'}
          defaultValue={defaultSearch ?? ''}
          onChange={e => update('q', e.target.value)}
          className="sc-input"
          style={{ paddingLeft: 30, fontSize: 13, height: 36, width: '100%' }}
        />
      </div>

      {/* Plan filter */}
      <select
        defaultValue={defaultPlan ?? 'all'}
        onChange={e => update('plan', e.target.value === 'all' ? '' : e.target.value)}
        className="sc-input"
        style={{ fontSize: 13, height: 36, paddingRight: 28, cursor: 'pointer', width: 'auto', minWidth: 120 }}
      >
        {planOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
