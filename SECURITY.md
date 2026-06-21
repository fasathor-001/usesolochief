# Security Policy

## Supabase Row-Level Security

Every table in the database has Row-Level Security (RLS) enabled — no exceptions (D-007).
RLS policies enforce that users can only read and write rows where `user_id = auth.uid()`.

Never disable RLS on any table. Never create a policy that allows cross-user access unless it is
explicitly required by a multi-tenant feature and reviewed before shipping.

When adding a new table, the migration must include:

```sql
alter table <table_name> enable row level security;

create policy "Users can manage their own <table_name>"
  on <table_name> for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

If a table has no user-facing data (e.g. internal logs), it must still have RLS enabled with an
explicit policy that denies all or restricts to service-role only.

## Environment Variables and Secrets

### What belongs in environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — public, safe to expose to browser
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, safe to expose to browser (protected by RLS)
- `SUPABASE_SERVICE_ROLE_KEY` — **never expose to browser or client code**
- `ANTHROPIC_API_KEY` — server-only
- `RESEND_API_KEY` — server-only
- `NEXT_PUBLIC_APP_URL` — public

### Rules

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It must only be used in server-side code
  (Server Actions, Route Handlers, server utilities). Never import it from a Client Component.
- Never log secrets to the console, even in development.
- Never commit `.env.local` or any file containing real credentials to the repository.
- `.env.local.example` must only contain empty keys and comments — no real values.
- Rotate any key that is accidentally committed immediately and treat it as compromised.

## No Secrets in the Repository

The `.gitignore` excludes `.env`, `.env.local`, and all `.env.*.local` files.

If you discover a secret has been committed:
1. Rotate the key immediately via the relevant provider dashboard.
2. Remove it from git history using `git filter-repo` or contact the provider to invalidate.
3. Inform the project owner.

## AI and Database Writes

The AI layer never writes directly to the database (D-008).

All AI-proposed changes are written to the `ai_actions` table with `status = 'proposed'`.
A separate validation step changes the status to `validated` before any write to production tables
is applied. This ensures the AI cannot corrupt or inject data into the system.

## File Uploads and Storage

Phase 1 does not include file uploads. When added in a later phase:

- All uploads must go through a Route Handler, not directly from the browser to Supabase Storage.
- The Route Handler must validate file type, size, and ownership before writing.
- Storage bucket policies must mirror RLS: users can only read and write their own objects.
- Accepted MIME types must be explicitly allowlisted — deny by default.
- Maximum file size must be enforced server-side, not only client-side.
- Filenames must be sanitised and replaced with a UUID-based path before storage.

## Audit Logging

The `commitment_events` table records every stage and permission change on a commitment.
The `corrections` table records every user-initiated correction to system-inferred values.
The `agent_runs` table records every AI agent invocation.

These tables must not be pruned or truncated without explicit product decision.

## Responsible Disclosure

If you discover a security vulnerability in SoloChief, please report it privately before
disclosing it publicly.

**Contact:** fasathor@icloud.com  
**Subject line:** `[SECURITY] <brief description>`

Please include:
- A description of the vulnerability
- Steps to reproduce
- The potential impact
- Whether you have a suggested fix

We aim to acknowledge reports within 48 hours and resolve confirmed vulnerabilities within 14 days.
We do not operate a paid bug bounty programme at this time, but we will credit researchers who
report issues responsibly.

Do not open a public GitHub issue for security vulnerabilities.
