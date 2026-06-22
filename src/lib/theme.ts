export type ThemeValue = 'light' | 'dark' | 'system'

export function applyTheme(value: ThemeValue) {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('dark')
  } else if (value === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export function getStoredTheme(): ThemeValue {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('sc-theme') as ThemeValue | null) ?? 'system'
}

export function setStoredTheme(value: ThemeValue) {
  localStorage.setItem('sc-theme', value)
  applyTheme(value)
  // Notify other components (e.g. topbar) without a shared provider
  window.dispatchEvent(new StorageEvent('storage', { key: 'sc-theme', newValue: value }))
}

export function cycleTheme(current: ThemeValue): ThemeValue {
  const order: ThemeValue[] = ['light', 'dark', 'system']
  return order[(order.indexOf(current) + 1) % order.length]
}

export const THEME_LABELS: Record<ThemeValue, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}
