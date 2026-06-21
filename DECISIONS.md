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
