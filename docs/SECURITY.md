# Security

## RLS — Row-Level Security

RLS is enabled on every Supabase table — no exceptions (D-007).

Every table uses the policy pattern:
```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

Users can only read and write their own rows. Cross-user access is impossible through the
client-side API. The anon key does not bypass RLS.

Adding a new table without RLS is a critical error. Every migration that creates a table
must include `alter table <table> enable row level security` and a corresponding policy
before the migration is considered complete.

---

## No AI Direct Database Writes

The AI never writes to any production table directly (D-008).

AI-proposed changes are written to `ai_actions` with `status = 'proposed'`.
Server-side validation checks the proposed change against business rules.
Only after validation does the server apply the change to the target table.

This prevents AI hallucinations from corrupting user data.

---

## Authentication

- **Provider:** Supabase Auth
- **Primary method:** Magic link (passwordless email)
- **Session handling:** `@supabase/ssr` with server-side cookie management
- **Route protection:** `src/proxy.ts` (Next.js 16 proxy convention) checks session on every request
- **Redirect URLs:** Always derived from `NEXT_PUBLIC_APP_URL` — never from `request.url`
  (prevents open redirect attacks where a malicious URL is passed in a query parameter)

---

## Environment Variables

| Variable | Visibility | Rule |
|----------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser) | Safe — protected by RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser) | Safe — protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Never expose client-side. Bypasses RLS.** |
| `ANTHROPIC_API_KEY` | Server only | Server Actions and Route Handlers only |
| `RESEND_API_KEY` | Server only | Server Actions and Route Handlers only |
| `NEXT_PUBLIC_APP_URL` | Public | Used for redirect URLs and absolute links |

---

## No Secrets in the Repository

`.env.local` is in `.gitignore` and must never be committed.
`.env.local.example` contains only empty keys — no real values.

If a secret is accidentally committed:
1. Rotate the key immediately via the provider dashboard
2. Treat the key as compromised from the moment of the commit
3. Remove from git history using `git filter-repo`
4. Notify the project owner

---

## Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Rules for use:

- Only in server-side code (Server Actions, Route Handlers, server utilities)
- Never imported in Client Components
- Never logged or returned in API responses
- Used only when a legitimate cross-user operation is required (e.g. admin scripts)
- All uses must be documented with a comment explaining why RLS bypass is necessary

---

## File Uploads (Future)

Phase 1 has no file uploads. When added:

- Route Handler validates file type, size, and ownership before writing to Storage
- Accepted MIME types are allowlisted — deny by default
- Maximum file size enforced server-side, not client-side only
- Filenames replaced with UUID-based paths before storage
- Storage bucket policies mirror RLS: users can only access their own objects

---

## Audit Trail

The following tables form the audit trail and must not be pruned or deleted:

| Table | What it records |
|-------|----------------|
| `commitment_events` | Every stage and permission change |
| `corrections` | Every user correction to system-inferred values |
| `agent_runs` | Every AI agent invocation |
| `ai_actions` | Every AI-proposed change and its validation outcome |
| `switch_requests` | Every switch challenge and its resolution |

---

## Responsible Disclosure

Report security vulnerabilities privately to: **fasathor@icloud.com**  
Subject: `[SECURITY] <brief description>`

Do not open a public GitHub issue for vulnerabilities.
We aim to acknowledge within 48 hours and resolve within 14 days.
