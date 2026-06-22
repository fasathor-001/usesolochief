# Architecture Decisions

This file is append-only. Never edit existing entries.

| ID    | Decision                                                                                          | Date          |
|-------|---------------------------------------------------------------------------------------------------|---------------|
| D-001 | Domain solochief.app secured June 21 2026 on Cloudflare                                           | 2026-06-21    |
| D-002 | Domain usesolochief.com secured June 21 2026 on Cloudflare                                        | 2026-06-21    |
| D-003 | Stack — Next.js 15 + Supabase + Anthropic API claude-sonnet-4-6 + Railway + Polar + Resend        | 2026-06-21    |
| D-004 | Phase 1 is web command centre only — no WhatsApp until Phase 2                                    | 2026-06-21    |
| D-005 | UK spelling throughout all copy and code comments                                                 | 2026-06-21    |
| D-006 | No Co-Authored-By trailer on any commits — author Frank A. fasathor@gmail.com only               | 2026-06-21    |
| D-007 | RLS enabled on every Supabase table from day one — no exceptions                                  | 2026-06-21    |
| D-008 | AI proposes, system validates, database writes — AI never writes directly to database             | 2026-06-21    |
| D-009 | Unknown is a first-class status — silence never equals completion                                 | 2026-06-21    |
| D-010 | Context package loads before every AI call — no exceptions                                        | 2026-06-21    |
| D-011 | Next.js 16.2.9 installed — proxy.ts used instead of middleware.ts                                 | 2026-06-21    |
| D-012 | Commitment Inventory built as first real feature — core brain of product                          | 2026-06-21    |
| D-013 | Stage changes always logged to commitment_events table                                            | 2026-06-21    |
| D-014 | Permission level auto-suggested based on stage selection                                          | 2026-06-21    |
| D-015 | Workspace auto-created on first login if none exists                                              | 2026-06-21    |
| D-016 | Complete /docs suite created — mandatory Astor Stack build standard                               | 2026-06-21    |
| D-019 | Auth redirect URL derived from NEXT_PUBLIC_APP_URL — never from request.url. Supabase site URL set to https://solochief.app. Callback at /auth/callback. | 2026-06-21    |
| D-020 | Next.js NEXT_PUBLIC_* vars must be passed as Docker build args — they are baked into the bundle at build time not injected at runtime. Standalone output mode used for Railway deployment. | 2026-06-21    |
| D-021 | SoloChief AI is generic and user-configurable. Onboarding templates (solo_founder, freelancer, student_builder, creator, professional, scratch) are suggestions only. No hardcoded product or user names in production logic. | 2026-06-21    |
| D-022 | Intelligence infrastructure built in Week 3 — 5 new tables: pattern_events, weekly_scores, streak_records, memory_references, user_intelligence_state. RLS enabled on all. | 2026-06-21    |
| D-023 | Progressive disclosure — intelligence features revealed based on data sufficiency thresholds, not time. Thresholds: 10 daily logs OR 2 reviews OR 5 switch/park events unlocks pattern voice. 4+ weeks unlocks weekly score and streak visibility. | 2026-06-21    |
| D-024 | Weekly score not shown until user completes at least 1 full weekly plan + Friday review. Before that threshold only Weekly Summary is shown. Score is 0-10, never displayed without sufficient data. | 2026-06-21    |
| D-025 | Streak tracking is quiet and text-only — no emojis, no badges, no fire icons, no gamification. A streak is an accountability signal not a reward mechanism. | 2026-06-21    |
| D-026 | The Honest Silence Rule — when insufficient data exists, AI says nothing meaningful rather than filling space with generic productivity tips. Exact phrase: "I need at least one completed week before I can give you meaningful feedback." | 2026-06-21    |
| D-027 | Onboarding creates the first weekly plan with main_focus_commitment_id set. Profile onboarded_at is set after onboarding completes. Dashboard auto-creates workspace on first login (D-015) so onboarding can always find a workspace. | 2026-06-21    |
| D-028 | Monday Command Centre enforces exactly 3 outcomes before locking. Lock button validates: main focus set + 3 non-empty outcomes. Locked plans cannot be edited. Plan status derived from locked_at: null = draft, non-null = active. | 2026-06-21    |
| D-029 | Switch Challenge — all switch requests logged to switch_requests table before decision. Decision is either approved (urgent reason selected) or blocked (not urgent selected). Both paths log to switch_requests. | 2026-06-21    |
| D-030 | Rescue Me is a sidebar-level modal available on every dashboard page. It provides 5 contextual responses with direct links — does not require AI call for Phase 1. AI Chat link available as one option for complex situations. | 2026-06-21    |
| D-031 | Parking Lot is a soft-queue for ideas that arrive mid-week. Items have status: waiting / scheduled / cleared / killed / actioned. Category: new_product / feature / content / personal / other. Source: web / whatsapp. Parked items reviewed on Monday plan; scheduled items show review_date. | 2026-06-22    |
| D-032 | Follow-ups are tracked with urgency (critical / high / normal / low) and status (open / waiting / completed / cancelled). Soft delete via deleted_at — completed and cancelled items still exist for reporting. Overdue count shown as red badge on sidebar nav item. | 2026-06-22    |
| D-033 | Friday Review has 7 sections: (1) weekly outcome ticks, (2) what shipped, (3) what slipped, (4) wrongly touched work, (5) missed follow-ups, (6) parked ideas, (7) below-level work, plus next-week focus commitment and stop-list change. Completing the review upserts a streak_records row. | 2026-06-22    |
| D-034 | AI Chat uses Anthropic streaming API (anthropic.messages.stream) with SSE. Context package is built before every message — profile, commitments, week plan, stop list, today log, overdue follow-ups, parking lot (last 5), switch requests this week, last review. Both user and assistant messages saved to ai_messages table. Model: claude-sonnet-4-6. | 2026-06-22    |
| D-035 | Command Centre (dashboard index) shows: personalised greeting, no-plan CTA, today snapshot, week-at-a-glance stats, attention items (overdue follow-ups, stale parking lot, inactive launch checklists), quick action grid, and progressive disclosure weekly score card when unlocked. | 2026-06-22    |
| D-036 | Complete UI redesign June 22 2026. Design system in globals.css using sc- prefixed classes. Standard: Linear/Sunsama quality. Tone: calm, operational, direct. No exclamation marks in system copy. Typography: 400 and 500 weight only. Sentence case everywhere. | 2026-06-22    |
