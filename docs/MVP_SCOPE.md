# MVP Scope

## What Is in MVP Phase 1 (Web Only)

The MVP is the web command centre. It is complete when a solo founder can:

1. Sign up and set up their commitment inventory
2. Set stages and permission levels on each commitment
3. Complete a Monday planning session
4. Confirm their today focus each morning
5. Log status updates through the day
6. Use the switch challenge when they want to change focus
7. Park ideas in the parking lot
8. Track admin and legal follow-ups
9. Manage a launch checklist (max 10 items)
10. Complete a Friday review and see a draft plan for next week
11. Chat with the AI using the full context package
12. Manage their communication preferences
13. Subscribe via Polar

All of the above is web-only. No WhatsApp in Phase 1.

---

## What Is Explicitly NOT in MVP

The following are out of scope for MVP. Do not build them.
Do not design for them. Do not leave "hooks" for them in the Phase 1 code.
Build for what is needed now.

| Feature | Why out of scope |
|---------|-----------------|
| Slack integration | Not in ICP workflow for solo founders. Adds complexity without retention value. |
| Gmail integration | Scope creep. Email management is a different product. |
| Google Calendar sync | Complex OAuth, bidirectional sync risk, out of ICP scope for Phase 1. |
| Mobile app | Web is sufficient for Phase 1. Native app requires separate build, release pipeline, and review process. |
| Team accounts | SoloChief is explicitly for solo founders. Teams are a different product with different dynamics. |
| Student / creator / life admin modes | ICP is solo founders. Modes add UX complexity and blur positioning. Build depth for one ICP first. |
| Kanban boards | SoloChief is not a task management tool. Boards encourage task-listing behaviour it actively discourages. |
| Full task management | Same reason as Kanban. Commitments are not tasks. Sub-tasks are for tools like Linear. |
| Complex analytics dashboards | Phase 3 feature. No data history in Phase 1 to make analytics meaningful. |
| Document uploads | Unnecessary for Phase 1. Adds storage, scanning, MIME type complexity. |
| Zapier / Make integrations | No webhook infrastructure in Phase 1. |
| API access for third parties | Not needed for MVP. |
| Multiple workspaces | One user, one workspace in Phase 1. |
| Import from Notion / Todoist | Nice to have. Not a launch blocker. Manual commitment entry is fine for early adopters. |

---

## The 30-Day Case Study

Parallel to the Phase 1 build, a 30-day solo founder case study is running.
The case study uses SoloChief AI manually (Google Sheets + daily WhatsApp notes) to:
- Validate the commitment/stage/permission model in practice
- Gather real language from a real solo founder under real workload pressure
- Produce content for the launch narrative

The case study runs independently of the build. Its outputs inform copy, onboarding flow,
and the initial commitment templates.

---

## Definition of Done for Phase 1 Launch

- [ ] All 13 MVP features working in production
- [ ] Zero TypeScript errors
- [ ] Zero broken routes
- [ ] Zero unprotected private routes
- [ ] Auth flow tested end to end (signup, magic link, callback, dashboard)
- [ ] RLS verified on all 30 tables
- [ ] Polar billing working (test mode first, then live)
- [ ] Railway deployment stable with health check passing
- [ ] solochief.app live on Cloudflare → Railway
- [ ] Privacy, Terms, and Support pages live
- [ ] At least 1 real user (founder) onboarded and using it daily
