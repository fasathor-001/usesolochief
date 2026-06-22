# SoloChief AI — Master Plan
**Version 1.6 — June 2026**
**Astor Stack Technologies**

---

## PRODUCT IDENTITY

**Name:** SoloChief AI
**Category:** Personal commitment and focus operating system
**Tagline:** Command Centre on web. Chief of Staff in WhatsApp. One brain behind both.
**Core promise:** SoloChief does not help you do more. It helps you decide what deserves your attention — and protects you from everything that does not.

**Domains:**
- solochief.app — product
- usesolochief.com — marketing

**Social:** @solochiefai
**Support:** hello@astorstack.com

---

## UNIVERSAL PRODUCT SCOPE (LOCKED PRINCIPLE)

SoloChief is not built only for founders, startups, or product builders.

**SoloChief is for anyone managing commitments, focus, follow-ups, ideas, responsibilities, and open loops — regardless of discipline, work, career, job, industry, or life stage.**

A commitment can be a product launch, client project, school assignment, exam, family responsibility, legal task, health appointment, invoice follow-up, creative project, job deadline, personal goal, admin duty, or idea that needs to be parked safely.

SoloChief must remain universal in its product logic, onboarding, templates, AI prompts, examples, empty states, and all user-facing copy.

Frank / Astor Stack may be used for demos, testing, and case studies only. It must never become the default product assumption.

---

## WHO SOLOCHIEF IS FOR

**Primary audience:** Anyone managing multiple commitments, responsibilities, follow-ups, ideas, and open loops across work or life.

**Initial wedge:** Solo founders, independent builders, freelancers, creators, students, professionals, and operators who feel overloaded by too many active commitments.

**Long-term audience:** Anyone who needs help deciding what deserves attention, what can wait, and what must not slip.

**The emotional problem SoloChief solves:**
> "I have too many things competing for my attention and I do not know what actually deserves focus today."

**The feeling SoloChief should create:**
> "This helps me manage my life and work." — not "This is only for founders running SaaS projects."

**What SoloChief is not:**
- Not a calendar app
- Not a task manager
- Not a project management tool
- Not a generic AI assistant
- Not another to-do list
- Not only for founders
- Not only for tech products
- Not only for work

**What SoloChief is:**
> A personal Chief of Staff for commitments, focus, and follow-ups — for anyone with too many open loops and not enough clarity on what deserves attention today.

---

## CHIEF OF STAFF LANGUAGE RULE

SoloChief uses "Chief of Staff" as a metaphor for clarity, focus, and follow-through — not as a corporate or executive concept.

It must not make users feel they need to be a founder, executive, or business owner to use the product. A student managing exams, a freelancer juggling clients, or a parent balancing work and family obligations all have a Chief of Staff need.

Whenever "Chief of Staff" appears in public-facing copy, it must be supported by plain language that any user can immediately understand:

- What deserves your attention today
- What can wait
- What must not slip
- What needs following up

The metaphor earns trust. The plain language closes understanding.

---

## UNIVERSAL SETUP EXAMPLES

SoloChief works for anyone managing commitments — whatever your discipline, career, or life situation.

**Founder / Builder**
- SaaS product launch
- Payment follow-up
- Legal and admin tasks
- Content and marketing
- New product ideas

**Freelancer / Consultant**
- Client delivery
- Invoice follow-ups
- Proposal deadline
- Admin and accounting
- Skill development

**Student**
- Exam preparation
- Assignments and deadlines
- Part-time job
- Side project
- Personal admin (rent, health, errands)

**Professional**
- Work project
- Manager follow-up
- Certification or training
- Family admin
- Health appointments

**Creator**
- Content calendar
- Brand deals
- Editing backlog
- Community follow-ups
- New content ideas

**Personal / Family**
- Renew passport
- Book doctor appointment
- Pay rent or bills
- Family obligations
- Health goals
- Finance follow-ups

The commitment engine is the same for every user. Templates are onboarding shortcuts — not separate modes or products.

---

## COMPETITIVE POSITIONING

| Competitor | What they own | Where SoloChief is different |
|---|---|---|
| Motion | AI calendar scheduling | SoloChief is commitment-first, not schedule-first |
| Reclaim | Calendar time protection | SoloChief protects attention, not just calendar blocks |
| Sunsama | Calm daily planning | SoloChief challenges switching and enforces focus boundaries |
| Akiflow | Universal inbox + time blocking | SoloChief is simpler, guided, and accountability-focused |
| Todoist | Simple task lists | SoloChief manages commitments with stages and permission levels |
| Notion Calendar | Calendar visibility | SoloChief sits above calendars as the "what matters?" layer |
| ClickUp | Team productivity platform | SoloChief is personal, calm, and lightweight |

**SoloChief's five core advantages:**
1. Commitment Map — not tasks, but commitments with stages and permission levels
2. Not Today / Stop List — permission to ignore things safely
3. Switch Challenge — actively protects focus from unnecessary switching
4. Parking Lot with trade-off logic — ideas captured, not lost, not acted on immediately
5. Friday Review — weekly accountability and honest reflection

**Best public differentiation line:**
> Most productivity tools help you organise more work. SoloChief helps you decide what deserves attention — and what should wait.

---

## PRICING

| Plan | Price | What is included |
|---|---|---|
| Free | $0/month | 3 commitments, web only, no AI features |
| Pro | $15/month | Unlimited commitments, AI Chat, AI planning |
| Operator | $24/month | Everything in Pro + WhatsApp Chief of Staff |
| Chief | $39/month | Everything in Operator + pattern intelligence + custom agents + priority support |

**Annual pricing (when introduced):**
- Pro: $12/month billed annually
- Operator: $19/month billed annually

**Private beta strategy:**
Show only Free, Pro, and Operator during private beta. Chief plan is hidden until pattern intelligence and custom agents are confirmed working and valuable.

**Free plan note:**
3 commitments is intentionally tight. A user who hits the limit and thinks "I have more than 3 things I am managing" is the user who should upgrade. That friction is a feature, not a bug. If beta testers consistently fail to reach the "too many open loops" feeling before hitting the limit, consider raising to 5 commitments.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Database | Supabase (Postgres + Auth + RLS) |
| AI | Anthropic API — current Claude Sonnet production model configured via environment variable |
| Hosting | Railway (Dockerfile builder) |
| DNS / CDN | Cloudflare |
| Billing | Polar |
| Email | Resend |
| WhatsApp | Twilio WhatsApp Business API |
| Storage | Cloudflare R2 |
| Repo | GitHub — fasathor-001/solochief-ai |

**Core technical rules:**
- RLS on every Supabase table — no exceptions
- AI proposes → system validates → database writes
- No hardcoded commitment or project names in production logic
- Soft deletes only (deleted_at)
- UK spelling throughout all copy and code comments
- No Co-Authored-By on any commit
- Author: Frank A. fasathor@gmail.com only

---

## PRODUCT ARCHITECTURE

### The SoloChief Operating Rhythm

```
Monday         → Weekly Plan (main focus, 3 outcomes, 1 override, stop list)
Every morning  → Today Focus (one outcome, not today list, follow-ups)
During day     → Log progress, park ideas, add follow-ups, request switch
End of day     → EOD log (done / partial / blocked / slipped)
Friday         → Friday Review (what happened, what slipped, next week)
```

### One Brain, Two Interfaces

```
Web Command Centre   → Planning, review, detail, full context
WhatsApp (Phase 2)  → Daily updates, quick commands, check-ins
```

Both write to the same Supabase database. Same context. Same rules.

---

## CORE PRODUCT OBJECTS

### 1. Commitments

A commitment is anything the user is carrying — not just tasks.

**Categories:**
Product, Client, Assignment, Content, Work Project, Personal, Legal/Admin, Finance, Health, Family, Idea, Other

**Stages:**
- Main Focus — the one primary commitment this week
- Active — in progress, receiving regular attention
- Launch / Deadline — approaching a fixed finish line
- Maintenance — keep it running, minimal new work
- Follow-up — waiting on someone or something
- Recurring — repeats on a schedule
- Parked — exists but not this week

**Permission Levels:**
- Can Interrupt — may displace today's focus if urgent
- Protected Block — needs dedicated time, no interruptions
- Checklist Only — close open items only, no new scope
- Maintenance Only — keep stable, no new work
- Follow-up Only — track and chase, no active build
- Parked — do not touch this week

**Commitment fields:**
- name, category, stage, permission level
- status, next action, due date
- last touched, related follow-ups
- commitment health indicator

### 2. Weekly Plan

Decides what matters this week. Locked on Monday.

**Includes:**
- One main focus commitment
- Exactly 3 weekly outcomes (enforced — no more, no less)
- One approved override (enforced — one only)
- Stop list (commitments that must not be touched)
- Follow-ups to close this week
- Plan status: Draft / Active / Reviewed

**Weekly rules:**
- One main focus — not two
- Exactly three outcomes — not four, not two
- One override — for genuine emergencies only
- Stop list is a hard block — switching requires a reason
- Unfinished outcomes move to the Friday Review

### 3. Today Focus

The most important daily screen. Answers: what should I do now?

**Includes:**
- Today's focus commitment (from weekly plan)
- One outcome for today
- Status pills: In progress / Done / Partial / Blocked / Slipped
- Update log action
- Request Switch action
- Not Today list (stop list + manually blocked items)
- Follow-ups due today
- EOD log section (shows after 3pm)

### 4. Not Today / Stop List

One of SoloChief's most important differentiators.

**Function:** Give users permission to ignore things safely.

**Rules:**
- Not Today items do not compete for attention
- Switching to a Not Today item triggers the Switch Challenge
- Weekly stop list items auto-populate Not Today
- Users can add manual Not Today items
- Removing from Not Today requires a reason

### 5. Switch Challenge

Triggered when a user tries to work on something outside today's focus.

**Six challenge paths:**
1. Something is broken and needs fixing now
2. This is urgent and cannot wait
3. A deadline or obligation just moved
4. Health, safety, or family — cannot defer
5. This week's approved override
6. Not urgent — park it and stay focused

**Behaviour:**
- Approved switches log reason to switch_requests
- Rejected switches park the idea automatically
- Every switch is logged for the Friday Review

### 6. Parking Lot

**Function:** Ideas captured safely. Not lost — waiting.

**Prevents:** New ideas from hijacking the week.

**Sections:**
- Parked — waiting for review
- Reviewing soon — scheduled for next Monday
- Cleared — actioned or promoted
- Archived — decided against (not "killed")

**Trade-off logic:**
- To promote a parked idea, something else must move out
- "Not now" is not "never"
- Parking history preserved

### 7. Follow-up Tracker

**Function:** Loops that must not slip.

**Groups:** Overdue / Due today / Due this week / Upcoming / Completed

**Each follow-up includes:**
- Title, person/company
- Related commitment
- Due date, urgency (Critical / High / Normal / Low)
- Next action
- Status (Open / Waiting / Completed / Cancelled)

**Sidebar badge:** Red count of overdue follow-ups always visible.

### 8. Checklists

**Function:** Freeze the final steps so almost-ready work actually ships.

**Rules:**
- 10 items maximum
- Add one only by removing one
- No new work until checklist reaches zero
- Closes scope creep permanently

**Use cases:** Launches, deadlines, client delivery, handovers, assignments, important personal and admin work

**Language note:** Checklists are not only for product launches. Use broad language: deadline checklist, handover checklist, assignment checklist, admin checklist, launch checklist.

### 9. Friday Review

**Function:** Weekly truth mirror. What actually happened?

**Seven sections:**
1. What actually got done this week
2. What did not get done (slipped outcomes auto-pulled)
3. What was wrongly touched (not planned)
4. Missed follow-ups (auto-pulled overdue)
5. What got parked this week
6. What work pulled attention away from what actually mattered
7. Next week intention

**Note on section 6:** The question "what work pulled attention away from what actually mattered" replaces the founder-specific phrase "work below your level." The same insight applies universally — to a student, freelancer, professional, parent, or founder. Internally it may be labelled below_level_text in the database, but the user-facing question must remain universal.

**After completing:**
- Updates streak records
- Increments intelligence state counters
- Checks if weekly score threshold is met
- Prepares Monday plan draft
- Redirects to Command Centre

### 10. Rescue Me

**Function:** Help the user recover when overwhelmed.

**Available from day 1 — no data threshold required.**

**Five rescue paths:**
1. Something urgent just came up
2. I am overwhelmed and do not know where to start
3. Something came up that is not an emergency but feels urgent
4. I am behind on something important
5. I need to think this through

**Behaviour:** Each path gives contextual guidance, reduces cognitive load, and returns the user to one clear next action.

### 11. AI Chat

**Function:** Context-aware Chief of Staff interface.

**Context package loads before every call — no exceptions:**
- All active commitments
- Weekly plan (outcomes, focus, override, stop list)
- Today's focus and status
- Overdue follow-ups
- Last 5 parking lot items
- Switch requests this week
- Intelligence state and thresholds
- Last Friday review summary
- Advice confidence level

**AI handles:**
- What should I focus on today?
- What can wait?
- Park this idea: [idea]
- Add a follow-up: [task] [date]
- I feel overwhelmed
- How was my week?
- What is overdue?

**Right-side context panel shows:**
- Today's focus
- Follow-ups due
- Weekly progress
- Stop list

### 12. Command Centre

**Function:** Morning briefing. What needs attention today?

**Layout:**
- Greeting (time-based: Good morning / afternoon / evening)
- Context line (week number + brief)
- Today's Focus card (teal left border)
- Needs Attention section
- Quick Actions grid (Park idea / Add follow-up / Log today / Start review)
- Right panel: Week at a Glance, outcomes progress, commitments summary

---

## STATUS SYSTEM

**Statuses:**
planned, confirmed, in_progress, done, partial, blocked, slipped, switched, wrongly_touched, unknown, needs_review

**Status sources:**
user_web, user_whatsapp, user_corrected, system_inferred, ai_suggested, ai_confirmed

**Unknown is a first-class status:**
- No response = no update
- No update = unknown
- Unknown does not mean done
- SoloChief must not guess when unknown
- Unknown items surface in Friday Review and context package

**Advice confidence levels:**
- High — 2+ reviews AND 10+ logs
- Medium — 1 review OR 5+ logs
- Low — insufficient data

**Clarification rule:** If confidence is below 0.75, ask before logging.

---

## CORRECTION FLOW

Users can correct AI mistakes at any time.

**Commands:**
- undo
- correct that
- wrong
- change last log
- wrong status — [correct status]

**Sources:** user_corrected always overrides ai_suggested or system_inferred

---

## COMMUNICATION MODEL

**Three interaction modes:**
1. Quick Tap — buttons and pills (default)
2. Natural Typing — AI interprets plain language
3. Structured Form — web forms for detail

All three write to the same database. Same accuracy.

**Default:** Quick Tap with Natural Typing fallback.

---

## AI AGENT ARCHITECTURE

Four built-in agents — all load the full context package before every call.

### Planning Agent
- Monday plan creation
- Weekly outcomes setting
- Main focus selection
- Stop list management
- Weekly review preparation

### Focus Agent (most important)
- Today Focus management
- Switch challenge enforcement
- Not Today protection
- Parking suggestions
- Overwhelm recovery

### Follow-up Agent
- Follow-up tracking
- Due follow-up surfacing
- Unresolved loop detection
- Legal/admin/payment/client follow-ups

### Review Agent
- Friday Review
- Pattern analysis
- Slipped item detection
- Next week suggestions

---

## INTELLIGENCE SYSTEM — PROGRESSIVE DISCLOSURE

Build the intelligence infrastructure now. Reveal it gradually based on data sufficiency.

**Honest silence rule:** When not enough data exists, say nothing rather than filling space with generic advice.

### Day 1 (available immediately)
- Morning Brief
- Today Focus
- Not Today List
- Parking Lot
- End-of-day Log
- Follow-ups
- Friday Summary (not score yet)
- Rescue Me
- Correction Flow

### After 1 completed weekly plan + Friday review
- Weekly Summary (outcomes, slipped, missed, parked)
- NOT Weekly Score yet

### After 2 reviews OR 10 daily logs OR 5 switch/park events
- Pattern Voice (carefully worded)
- "This looks like a pattern." — never "You always do this."
- Early attention patterns
- Repeated slippage notices

### After 4+ weeks
- Weekly Score (0–10, visible)
- Direct pattern statements
- Streak visibility (subtle, text only, no gamification)
- Full memory references

### AI Voice Progression
```
Week 1:  "What matters today?"
Week 2:  "Here is what happened last week."
Week 3:  "This looks like a pattern."
Week 4+: "This keeps slipping. What is blocking you?"
```

---

## COMPLEXITY CONTROL RULE

SoloChief may have a deep internal system, but the user should experience it simply.

The user should not need to understand every product concept on day one.

Day-one language should focus on:

* What are you carrying?
* What matters this week?
* What deserves attention today?
* What can wait?
* What must not slip?

Internal concepts such as permission levels, switch challenge paths, intelligence thresholds, agent modes, pattern detection, and status sources should be introduced gradually only when they become useful.

If a feature requires a long explanation before the user can benefit from it, simplify the feature or delay it.

The product may be intelligent underneath, but it must feel calm, obvious, and usable on the surface.

---

## CHIEF OF STAFF LANGUAGE RULE

SoloChief uses “Chief of Staff” as a metaphor for clarity, focus, and follow-through.

It must not make users feel they need to be a founder, executive, business owner, or operator to use the product.

Whenever “Chief of Staff” appears in public copy, onboarding, empty states, or product messaging, it should be supported by plain language:

* what deserves attention
* what can wait
* what must not slip
* what needs follow-up
* what should be parked safely

The user should understand SoloChief even if they have never used the phrase “Chief of Staff” in their own life or work.

---

## ACTIVATION MEASUREMENT

SoloChief has two activation levels.

### Initial activation

A user is initially activated when they:

1. Create at least 3 commitments
2. Select one main focus
3. Create or confirm a weekly plan
4. Set Today Focus
5. Add at least one Not Today or Parking Lot item
6. Add or confirm at least one follow-up
7. Use Today Focus at least twice in the first week

Initial activation means the user has experienced SoloChief’s daily clarity loop.

### Full activation

A user is fully activated when they:

1. Complete initial activation
2. Complete one Friday Review
3. Return to start or confirm the next weekly plan

Full activation means the user has completed the full SoloChief rhythm:
Weekly Plan → Today Focus → Parking / Follow-ups → Friday Review → next week.

SoloChief is not activated by signup alone. Activation means the user has used SoloChief to decide what deserves attention, what can wait, and what must not slip.

---

## PRODUCT TEMPLATES

Templates pre-fill commitment categories and stages. Same engine underneath — not separate modes or products.

**Rule:** Templates are onboarding shortcuts. Every user uses the same commitment engine. Templates must never become hardcoded modes or separate product experiences.

**Seven templates:**
1. Solo Founder / Builder — projects, launches, clients, admin, content
2. Freelancer / Consultant — client work, invoices, deadlines, follow-ups
3. Student — assignments, exams, work, personal admin, and anything else you are managing
4. Creator — content calendar, ideas, publishing, community
5. Professional — work projects, meetings, deadlines, admin
6. Personal / Family — household, health, finance, family responsibilities
7. Start from scratch — build your own structure

---

## DESIGN SYSTEM

**Visual identity:** Calm Command Centre
**Reference quality:** Linear, Sunsama, Notion level

**Brand colours:**
```
--sc-midnight:  #0F1B2D   sidebar, headers
--sc-teal:      #00C2A8   CTAs, active states, accents
--sc-bg:        #F8F9FA   page background
--sc-surface:   #FFFFFF   cards, panels
--sc-text:      #0D0D0D   primary text
--sc-muted:     #64748B   secondary text
--sc-border:    #E2E8F0   borders
--sc-error:     #EF4444   errors, overdue
--sc-warning:   #F59E0B   warnings
--sc-success:   #10B981   success, done
```

**Typography rules:**
- 400 and 500 weight only — never 600 or 700
- Sentence case everywhere — never ALL CAPS in user-facing text
- Section labels are the only uppercase text

**Layout pattern:**
- Two-column layout: main work area + right context panel
- Right panel is sticky — follows scroll
- Mobile: right panel collapses below main content

**Tone rules:**
- "What deserves attention today?" — not "Crush your goals"
- "Parked safely." — not "Great job parking that!"
- "Week locked." — not "Week locked!"
- Never exclamation marks in system messages
- No AI hype language

---

## COMPLEXITY CONTROL RULE

SoloChief may have a deep internal system. The user should experience it simply.

The user should not need to understand every product concept on day one. The system should teach itself through use, not through explanation.

**Day-one language must focus only on:**
- What are you carrying?
- What matters this week?
- What deserves attention today?
- What can wait?
- What must not slip?

**Internal concepts that must be introduced gradually — only when they become useful:**
- Permission levels
- Switch challenge mechanics
- Intelligence thresholds and data gates
- Agent modes
- Pattern detection and pattern voice
- Weekly score and streak tracking

**The complexity test:**
If a feature requires a long explanation before the user can benefit from it, either simplify the feature or delay it.

SoloChief's biggest enemy is not competitors. It is over-explaining itself.

---

## PRIVATE BETA READINESS

**In place:**
- PRIVATE BETA badge in topbar
- Feedback link: hello@astorstack.com
- No "coming soon" or "building now" copy anywhere
- Clean empty states that teach the user
- PWA installable
- Mobile-first layout
- Onboarding reset page protected in production

**The only test that matters in private beta:**
> Can a user complete one week and say: "I feel clearer"?

If yes, SoloChief is working. If no, something in the product or copy is failing — not the roadmap.

---

## ACTIVATION GOAL

A new user is considered activated in two stages.

**Initial activation — user has experienced core value:**
- 3 or more commitments created
- Today Focus set at least once
- At least one Not Today or Parking Lot item added
- At least one follow-up added or confirmed

**Full activation — user has completed the weekly rhythm:**
- Weekly plan completed and locked
- Friday Review completed
- User returns for the next Monday plan without prompting

SoloChief is not activated when a user only signs up. Initial activation proves the user understands the product. Full activation proves the product is part of their weekly rhythm.

Track both separately. Do not mark a user as failed if they have completed initial activation but not yet reached full activation.

---

## FIRST-WEEK USER JOURNEY

SoloChief is a rhythm product. The first week matters more than the onboarding screen.

**Day 0 — Sign up and onboarding:**
User adds commitments, chooses a template or starts from scratch, and identifies everything they are currently carrying.

**Day 1 (Monday) — First weekly plan:**
User sets one main focus, three outcomes, a stop list, and locks the plan. SoloChief confirms what this week is for.

**Daily — Today Focus:**
Each morning, user confirms today's focus and one outcome. During the day they log progress, park distractions, add follow-ups, and request switches only when necessary.

**End of day — EOD log:**
User logs done, partial, blocked, or slipped. Unknown is acceptable — but not the default.

**Friday — First review:**
User completes Friday Review and sees what got done, what slipped, what was parked, and what should shape next week.

**Success signal:**
By the end of week one, the user feels less scattered and more clear. If they return on Monday to set the next week's plan without being prompted, SoloChief is working.

**Failure signal:**
If the user only added commitments and never opened Today Focus or completed a Friday Review, they have not experienced SoloChief's core value.

---

## PLAN ENTITLEMENT MATRIX

This is the definitive feature-gating reference. Every billing and access decision must match this table.

**Free — $0/month**
- 3 commitments maximum
- Web Command Centre
- Today Focus
- Parking Lot (unlimited ideas — soft limit of 20 to be added when abuse is confirmed)
- Follow-ups (unlimited — soft limit of 10 to be added when abuse is confirmed)
- Checklists
- Friday Review (no score)
- No AI Chat
- No AI planning
- No pattern intelligence
- No WhatsApp
- No custom agents
- No email reminders

**Free plan abuse protection note:**
Parking Lot and Follow-ups are currently unlimited on Free to keep the product trustworthy. Once real usage patterns prove abuse is happening, apply soft limits: 20 parked ideas and 10 open follow-ups. Upgrade prompt shown at limits, not a hard wall. The 3 commitment limit remains the primary Free constraint.

**Pro — $15/month**
- Unlimited commitments
- Everything in Free
- AI Chat (full context package)
- AI planning assistance
- Weekly Review intelligence
- Email reminders (welcome, Monday plan, Friday review, overdue follow-ups)
- No WhatsApp
- No pattern intelligence
- No custom agents

**Operator — $24/month**
- Everything in Pro
- WhatsApp Chief of Staff
- WhatsApp quick commands
- Daily morning check-in
- End-of-day log prompt
- Friday review through WhatsApp
- Follow-up reminders through WhatsApp
- Maximum 3 proactive WhatsApp messages per day
- Quiet hours enforced

**Chief — $39/month (hidden during private beta)**
- Everything in Operator
- Pattern intelligence (after data thresholds met)
- Weekly score (after 4+ weeks)
- Pattern Voice
- Custom Agents
- Memory references
- Priority support

---

## TRUST AND PRIVACY PRINCIPLES

SoloChief may contain some of the most personal data a user holds — exam deadlines, family obligations, health appointments, legal tasks, financial follow-ups, career decisions, and personal goals.

**Data rules:**
- User data belongs to the user — always
- Never expose one user's commitments, follow-ups, or context to any other user
- RLS must protect every user-owned table — no exceptions
- AI prompts must only load the authenticated user's permitted context
- AI must never reference or reveal one user's data while serving another
- Sensitive commitments must never appear in public marketing, screenshots, logs, or demos unless manually created as demo data

**Deletion and export:**
- Data export must be available before full public launch
- Deletion is soft-delete first — permanent deletion handled carefully with confirmation
- Users must be able to delete their account and all associated data

**Visible trust surfaces (required before public launch):**
- Export my data — downloadable file of all commitments, plans, logs, and reviews
- Delete my account — with confirmation and clear explanation of what is removed
- What SoloChief's AI sees — a plain-language explanation of the context package
- Privacy policy — clear, human-readable
- Terms of service — clear, human-readable
- Support path — hello@astorstack.com visible and accessible

**Confidence and transparency:**
- SoloChief must tell users when it is uncertain
- SoloChief must show why it made a suggestion when relevant
- SoloChief must never present inferred behaviour as confirmed fact
- Users must always be able to correct, undo, or override any AI action

---

## PRIVATE BETA SUCCESS CRITERIA

Private beta is successful when the following are true across the majority of testers:

**Understanding:**
1. Users understand what SoloChief does without a long explanation
2. Users can add commitments without confusion
3. Users understand the difference between Today Focus and the Parking Lot

**Usage:**
4. Users can identify today's focus within 2 minutes of opening the app
5. Users understand and use Not Today at least once in the first week
6. Users return for Friday Review without being forced
7. Users add follow-ups unprompted after the first day

**Outcome:**
8. Users say SoloChief helped them feel clearer or less scattered
9. Users ask for reminders or WhatsApp because they want SoloChief to stay with them during the day
10. Users do not describe SoloChief as "just another task manager"

**Private beta is not successful if:**
- Users only use SoloChief as a static to-do list and never engage with Today Focus or Friday Review
- Users feel confused about what to do after onboarding
- Users do not understand what the Parking Lot is for
- Users describe the product as "like Notion" or "like Todoist"

---

## PRODUCT ANTI-PATTERNS (NEVER BUILD THESE)

Every feature request must be checked against this list. If a proposed feature leads toward any of the following, it does not belong in SoloChief.

**SoloChief must never become:**
- A generic task manager
- A calendar-first scheduling tool
- A project management platform
- A team collaboration suite (before the core product is proven)
- A generic AI chatbot that answers anything without context
- An open-ended AI agent builder where users can build anything
- A dashboard full of vanity metrics and charts
- A habit tracker with streaks, points, and gamification
- A place where users dump everything with no decision support
- A tool that tells users what to do without understanding their commitments
- A product that celebrates busyness instead of protecting focus

**The anti-pattern test:**
Before building any feature, ask: does this help the user do one of these five things?

1. Decide what deserves attention
2. Protect focus from unnecessary switching
3. Park what should wait
4. Track what must not slip
5. Review what actually happened

If a feature does not support at least one of these five outcomes, it does not belong in SoloChief.

---

## PRODUCT RULES (NEVER BREAK)

**Focus rules:**
- One main focus per week
- Exactly three weekly outcomes
- One override only
- Stop list is a hard block
- No same-day plan change without reason

**Checklist rules:**
- 10 items maximum
- Add one only by removing one
- No new work until checklist closes

**AI rules:**
- AI proposes → system validates → database writes
- AI must not silently write uncertain updates
- Confidence below 0.75 → ask before logging
- Important recommendations must explain why
- Unknown is a first-class status — never guess

**Logging rules:**
- No response means no update
- No update means unknown
- Unknown does not mean done
- Stale context means SoloChief should not assume

**Correction rules:**
- User correction always overrides AI interpretation
- Undo and correction must always be available
- user_corrected is the highest-trust source

**Design rules:**
- UK spelling throughout all copy and code comments
- No exclamation marks in system messages
- Sentence case everywhere
- No "killed" — use "archived"
- No "coming soon" or "building now" visible to users
- No Co-Authored-By on any commit

**Universal scope rule (locked):**
- SoloChief is for anyone managing commitments, focus, follow-ups, ideas, responsibilities, and open loops — regardless of discipline, work, career, job, industry, or life stage
- SoloChief must not assume the user is a founder, developer, creator, business owner, student, or employee — it should adapt to the user's commitments, not their title
- Frank / Astor Stack may be used for demos, seed data, testing, and case studies only
- Production logic, onboarding, copy, templates, database rules, AI prompts, and empty states must remain generic and useful to any user managing commitments
- No hardcoded commitment or project names in production logic

---

## DECISIONS LOG

All product decisions are logged in `DECISIONS.md` with sequential D-numbers.
Current status: see `DECISIONS.md` for the latest D-number.
Every significant decision must be appended before deployment.

---

## BUILD PRIORITY ORDER

### Immediate (before first testers)
1. Settings save to database
2. Email sequences via Resend
3. Polar billing with plan enforcement

### After private beta opens
4. Tester feedback collection and fixes
5. WhatsApp Phase 2 (Operator plan)
6. Marketing site upgrade (usesolochief.com)
7. Functional Checklists feature

### After WhatsApp is stable
8. Pattern intelligence (Chief plan)
9. Custom Agents (Chief plan)
10. Calendar integration
11. Advanced email digest

### Later
12. Gmail / Slack / Notion integrations
13. Voice input
14. Delegation tracking
15. Client-facing status share
16. Analytics dashboard
17. Native mobile app (only if PWA proves insufficient)

---

## PHASE 2 — WHATSAPP CHIEF OF STAFF

**Gated at Operator plan ($24/month)**

**Routes:**
- /api/whatsapp/inbound
- /api/whatsapp/send
- /api/cron/daily-focus
- /api/cron/monday-plan
- /api/cron/friday-review

**Commands:**
```
confirm         → confirm today's focus
change          → change today's focus
done            → mark today done
partial:[note]  → mark partial with note
blocked:[note]  → mark blocked with note
slipped         → mark slipped
switched:[note] → log a switch with reason
park:[idea]     → park an idea immediately
fu:[task][date] → add a follow-up
log:[note]      → add a daily log note
today           → get today's focus summary
status          → get current status
week            → get week summary
parking         → see parking lot
followups       → see follow-ups
review          → start Friday review
plan            → see weekly plan
undo            → undo last action
correct that    → correct last AI interpretation
wrong           → flag last update as wrong
```

**Check-in rhythm:**
- Monday: weekly plan reminder
- Morning: focus confirmation card
- Optional midday: check-in nudge
- End of day: EOD log prompt
- Friday: review reminder

**Rules:**
- Maximum 3 proactive messages per day
- Quiet hours enforced
- User controls check-in intensity

---

## PHASE 3 — PATTERN INTELLIGENCE

**Gated at Chief plan ($39/month) — hidden during beta**

**Features:**
- Pattern detection engine
- Weekly score (0–10, visible after 4+ weeks)
- Attention debt score
- Recurring slip detection
- Attention pulled away tracking (internal: below_level)
- Weekly scorecard
- Pattern Voice (careful wording, data-gated)
- Context decay warnings
- Memory references (surfaced in AI Chat)
- Streak visibility (subtle, weekly rhythm only)

**Pattern types detected:**
- repeated_slip
- wrong_switch
- idea_spike
- follow_up_miss
- launch_avoidance
- focus_drift

---

## PHASE 4 — CUSTOM AGENTS

**Gated at Chief plan**

Custom Agents allow users to create specialised focus agents for specific commitment areas. They must operate inside the SoloChief engine — not become generic chatbots.

**Rule:** Custom Agents are not an open agent-builder platform. They are personalised Chief of Staff configurations for specific areas of the user's life or work.

**Each Custom Agent includes:**
- Name and purpose
- Linked commitments
- Linked follow-ups
- Context scope (which data it loads)
- Check-in rhythm
- Tone preference
- Permission rules
- Custom instructions

**Example Custom Agents:**
| Agent | Function |
|---|---|
| Launch Agent | Tracks checklist, blockers, deadline, shipping steps |
| Client Agent | Tracks delivery, follow-ups, invoices, next actions |
| Admin Agent | Tracks legal, finance, tax, paperwork, renewals |
| Content Agent | Tracks calendar, drafts, publishing, repurposing |
| Study Agent | Tracks assignments, exams, reading, deadlines |
| Personal Agent | Tracks family, health, finance, errands |

**Plan availability:**
- Free — no custom agents
- Pro — built-in agents only
- Operator — built-in agents + WhatsApp
- Chief — custom agents + pattern intelligence

---

## PHASE 5 — INTEGRATIONS

All integrations are later roadmap. Core product must prove value without them first.

**Calendar:** Google Calendar sync, focus blocks, deadline import
**Productivity:** Notion, Linear, GitHub
**Communication:** Gmail, Slack
**Finance:** Stripe, Paystack payment follow-up alerts
**Voice:** Voice input for parking ideas and logging progress

---

## PHASE 6 — ADVANCED FEATURES

- AI-generated weekly brief (auto-written Monday morning)
- Delegation tracking (assign follow-ups, track who owes what)
- Client-facing status share (read-only weekly status)
- Recurring commitment tracking
- Public accountability partner (opt-in Friday Review share)
- Analytics dashboard (focus quality, completion rates, switch trends)
- Native mobile app (PWA-first always; native only if usage proves need)

---

## PHASE 7 — MARKETING SITE

**usesolochief.com full build:**
- Hero: "Your personal Chief of Staff for commitments, focus, and follow-ups."
- Supporting: "Whether you are a founder, freelancer, student, professional, or just someone managing too many open loops — SoloChief helps you decide what deserves attention today."
- Problem section: "You do not have a time problem. You have a focus problem."
- How it works (5 steps)
- Feature highlights (Not Today, Switch Challenge, Parking Lot, Friday Review)
- Pricing section (Free / Pro / Operator)
- Social proof and testimonials
- Build in public section
- Blog and case study hub
- Email capture for waitlist

---

## CASE STUDY (INTERNAL VALIDATION)

This is one internal validation case — not the default SoloChief setup.

Frank Asathor (founder, Astor Stack Technologies) is running SoloChief AI's 30-day manual case study using his own active commitments across six live projects.

**Purpose of this case study:**
- Validate whether SoloChief protects focus under real multi-commitment pressure
- Generate honest build-in-public content for LinkedIn and YouTube
- Produce the first real tester testimonial
- Prove or disprove Mohit Meena's challenge: "will it protect the day or just become another inbox?"

**Important:** Frank's portfolio (RevenueLoop, Complibase, TrustedPoll, NotedProof, ShowMePrice.ng, Royal Ledger) is demo and case-study data only. It must never be referenced in production logic, onboarding copy, AI prompts, or empty states. SoloChief's architecture must remain universal.

---

*Last updated: June 22, 2026 — Version 1.6*
*Author: Frank A. — Astor Stack Technologies*
*This document is the source of truth for SoloChief AI product decisions.*
*Locked principle: SoloChief is for anyone managing commitments, focus, and open loops — regardless of discipline, title, career, or life stage.*
*Next review: after private beta opens.*
