# Testing and QA

## Principle

Every build step must pass before committing. Every feature must be manually verified
before marking it complete. Tests catch regressions. Manual testing catches reality.

---

## Required Before Every Commit

### 1. TypeScript

```bash
npx tsc --noEmit
```

Zero errors required. Warnings are acceptable but should be tracked and resolved.

### 2. Lint

```bash
npm run lint
```

Zero errors required. ESLint is configured by Next.js defaults.

### 3. Build

```bash
npm run build
```

Production build must succeed with zero errors. Build warnings related to bundle size
should be investigated if they exceed Next.js defaults.

---

## Auth Flow Tests

Test manually after any change to auth pages, middleware (`proxy.ts`), or Supabase client setup.

| Test | Expected |
|------|----------|
| Visit `/dashboard` when logged out | Redirect to `/auth/login` |
| Visit `/auth/login` when logged in | Redirect to `/dashboard` |
| Submit magic link form with valid email | "Check your email" screen shown |
| Click magic link in email | Redirect to `/auth/callback` → `/dashboard` |
| Click magic link in email (first time, no workspace) | Redirect to `/onboarding` |
| Complete onboarding | Redirect to `/dashboard/today` |
| Click "Sign out" | Redirect to `/auth/login`, session cleared |
| Visit `/dashboard/commitments` when logged out | Redirect to `/auth/login` |

---

## RLS Verification

Test in Supabase SQL editor after schema changes.

```sql
-- Should return 0 rows when queried as a different user
select * from commitments where user_id != auth.uid();

-- Should fail with RLS violation
insert into commitments (user_id, workspace_id, title, ...)
values ('00000000-0000-0000-0000-000000000000', ...);
```

Every new table must be verified with:
1. Attempt to select another user's rows → 0 rows returned
2. Attempt to insert a row with another user's `user_id` → policy violation error

---

## Commitment Inventory Tests

| Test | Expected |
|------|----------|
| Add commitment with all required fields | Commitment appears in list under correct stage |
| Add commitment with empty name | Validation error shown inline |
| Add commitment with name < 2 chars | Validation error shown inline |
| Edit commitment name | Updated name shown on card |
| Change stage via edit modal | Confirmation shown; stage updated; event logged in commitment_events |
| Change permission via edit modal | Permission updated; event logged |
| Delete commitment | Commitment removed from list; soft delete (deleted_at set) |
| Filter by stage | Only commitments in that stage shown |
| Filter by category | Only commitments in that category shown |
| Search by name | Matching commitments shown |
| Empty state (no commitments in a stage) | "No commitments in this stage yet" shown |

---

## Mobile Layout Checks

Test in Chrome DevTools at 390px width (iPhone 15 simulation).

| Check | Expected |
|-------|----------|
| Sidebar | Collapses to hamburger menu |
| Commitment cards | Stack vertically, no horizontal overflow |
| Add commitment modal | Scrollable, full-width, no field cutoff |
| Navigation | All items accessible via mobile menu |
| Buttons | Minimum 44px touch target |
| Form inputs | No zoom-in on tap (font-size ≥ 16px) |

---

## No Broken Links

Before every deployment:

| Check | Expected |
|-------|----------|
| All sidebar navigation items | Route exists and returns 200 |
| All CTA buttons in empty states | Open correct modal or route |
| "Sign out" button | Works and redirects to login |
| Auth page links (Login ↔ Signup) | Navigate correctly |
| Footer links (if any) | No 404s |

---

## No Placeholder Buttons

Before shipping any feature, verify:

| Check | Expected |
|-------|----------|
| No buttons with `onClick={() => {}}` | Every button has a real action |
| No TODO comments in rendered UI | All placeholders replaced |
| No "Coming soon" text inside a feature page | Placeholder pages are in the dashboard only if feature genuinely unbuilt |
| No disabled submit buttons that are always disabled | Only disabled during loading state |

---

## No Dead CTAs

A CTA (call to action) is dead if:
- It navigates to a 404
- It opens a modal with no submit action
- It triggers a function that does nothing
- It shows a toast that says "Coming soon"

All CTAs must do what they say before being deployed.

---

## No Console Errors

Before every commit, open the browser console and verify:

| Check | Expected |
|-------|----------|
| Zero `console.error` calls | No errors in console |
| Zero `console.warn` about React key props | Keys on all list items |
| Zero `console.warn` about missing alt text | All images have alt |
| Zero unhandled promise rejections | All async calls have try/catch or error handling |
| Zero Next.js hydration errors | Server and client render match |

---

## No Unprotected Private Routes

Verify that every route under `/dashboard` and `/onboarding` redirects to `/auth/login`
when accessed without a session.

```bash
# Test with curl (no cookies = no session)
curl -I https://solochief.app/dashboard
# Expected: 307 redirect to /auth/login

curl -I https://solochief.app/dashboard/commitments
# Expected: 307 redirect to /auth/login
```

The `proxy.ts` middleware handles this. If middleware is changed, re-test all protected routes.

---

## Server Action Tests

For every server action, verify:

| Check | Expected |
|-------|----------|
| Called with valid input | Returns `{ data: ..., error: null }` |
| Called with invalid input (Zod) | Returns `{ data: null, error: '...' }` |
| Called by user who does not own the record | Returns `{ data: null, error: 'Not found' }` |
| Called without active session | Returns `{ data: null, error: 'Not authenticated' }` |

---

## QA Checklist Before Phase 1 Launch

- [ ] TypeScript: zero errors
- [ ] Lint: zero errors
- [ ] Build: succeeds
- [ ] Auth flow: all 8 tests pass
- [ ] RLS: verified on all 30 tables
- [ ] Commitment inventory: all 11 tests pass
- [ ] Mobile: all 6 layout checks pass
- [ ] No broken links
- [ ] No placeholder buttons
- [ ] No dead CTAs
- [ ] No console errors
- [ ] No unprotected routes
- [ ] Server actions: all tests pass for all actions
- [ ] Polar billing: test mode checkout works
- [ ] Railway deployment: health check passing
- [ ] Custom domain: solochief.app resolves correctly
