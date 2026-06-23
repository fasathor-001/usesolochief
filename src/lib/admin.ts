export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}
