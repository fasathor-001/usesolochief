# SoloChief AI — Chief of Staff Performance Standard v1.0

**Product:** SoloChief AI
**Domain:** solochief.app
**Prepared by:** Astor Stack Technologies
**Owner:** Frank A.
**Spec type:** Product standard, operating doctrine, and performance framework
**Status:** Recommended global standard
**Decision ref:** D-108
**Location:** `docs/CHIEF_OF_STAFF_PERFORMANCE_STANDARD.md`
**Language:** UK English

---

## 1. Purpose

This document defines the standard SoloChief AI must meet to be considered useful, productive, and valuable to users.

SoloChief is not a generic AI assistant, chatbot, task manager, or productivity dashboard. SoloChief is a personal AI Chief of Staff for solo operators. Its job is to help users start the week with clarity, protect their focus during the week, close open loops, and end the week with honest control instead of scattered guilt.

The product must be judged by one question:

> Is SoloChief helping the user operate with more clarity, focus, accountability, and control?

If the answer is no, the feature, agent behaviour, notification, or workflow must be improved.

---

## 2. The Chief of Staff Standard

A great Chief of Staff does six things:

1. **Holds the full picture**
   Knows every open commitment, follow-up, deadline, parking-lot item, and unresolved decision.

2. **Protects focus**
   Shields the principal from noise and keeps them on the work that matters most.

3. **Closes loops**
   Makes sure nothing important falls through the cracks.

4. **Prepares the week**
   Ensures Monday starts with clarity, not chaos.

5. **Closes the week**
   Ensures Friday ends with honest accounting, not guilt or confusion.

6. **Speaks when it matters**
   Proactive when there is risk, quiet when there is no value to add.

SoloChief is measured against all six. If the product does not do these consistently for a user, it has not earned its subscription.

---

## 3. The Product Promise

SoloChief should help every active user answer four questions at any time:

1. **What matters most right now?**
2. **What am I committed to this week?**
3. **What is slipping or waiting on me?**
4. **What should I stop, park, or defer?**

A user should never need to search across notes, memory, emails, chats, or scattered tools to understand their own operating picture.

SoloChief exists to reduce mental load.

The emotional outcome should be:

> “I know what matters. I know what is slipping. I know what to do next.”

---

## 4. The Three Core Product Health Metrics

SoloChief’s performance is measured through three primary metrics.

### 4.1 Weekly Rhythm Completion Rate

**Definition:** Percentage of active users who complete both a weekly plan and a Friday Review in the same week.

**Why it matters:**
This measures whether the user is experiencing the full SoloChief operating loop.

**Target:**

* Launch target: >40% of active users weekly
* 90-day target: >60% of active users weekly

**Formula:**
`users_with_weekly_plan_and_friday_review / active_users`

---

### 4.2 Loop Closure Rate

**Definition:** Percentage of commitments and follow-ups resolved during the week.

**Why it matters:**
A Chief of Staff is judged by whether important things stop falling through the cracks.

**Formula:**
`resolved_commitments_and_followups / total_open_commitments_and_followups`

**Healthy signal:**
A user closes at least one meaningful loop per week.

---

### 4.3 Clarity Score

**Definition:** A weekly self-reported signal asking whether the user feels clearer and more in control.

**Question shown during Friday Review:**

> Do you feel clearer about what matters next?

Options:

* Clear
* Somewhat clear
* Still scattered

**Why it matters:**
SoloChief is not only selling productivity. It is selling relief, clarity, and operational control.

A user can complete tasks and still feel overwhelmed. Clarity Score captures the emotional value of the product.

---

## 5. The Weekly Operating Rhythm

SoloChief’s core value is delivered through a weekly rhythm. Features should support this rhythm instead of distracting from it.

---

### 5.1 Monday — Plan

Monday is for clarity.

The user should enter the week with a simple operating plan.

**Minimum viable weekly plan:**

* 1 main focus
* 1 must-finish outcome
* 1 thing to stop, park, or defer

**Expanded weekly plan:**

* 1 main focus commitment
* Up to 3 weekly outcomes
* Stop list
* Key follow-ups
* Known risks or blockers

**SoloChief responsibilities on Monday:**

* Prompt the user to create the weekly plan
* Recommend a realistic plan based on active commitments
* Flag overload before the user overcommits
* Ask what should be stopped or parked
* Avoid creating a plan that is too large to execute

**Success looks like:**
The user starts the week knowing what matters most.

**Failure looks like:**
The user enters the week with no plan, too many priorities, or unclear commitments.

---

### 5.2 Tuesday to Thursday — Execute

Tuesday to Thursday are for protecting focus and closing loops.

**SoloChief responsibilities during execution days:**

* Keep Today Focus visible and simple
* Surface overdue follow-ups
* Challenge unnecessary context switches
* Remind the user of the current commitment
* Help the user park distractions without losing them
* Detect repeated slipping
* Keep nudges light, useful, and non-guilt-based

**Success looks like:**
The user spends more time on the right work and fewer things are forgotten.

**Failure looks like:**
The user keeps switching, ignores follow-ups, and loses track of commitments.

---

### 5.3 Friday — Review

Friday is for honest accounting.

The Friday Review should help the user understand:

* What got done
* What slipped
* What needs attention
* What should be parked
* What should carry into next week
* Which agents helped or failed to help

**SoloChief responsibilities on Friday:**

* Generate a clear weekly review
* Avoid guilt-based language
* Summarise commitments and follow-ups
* Ask for a Clarity Score
* Collect user feedback on usefulness
* Feed agent performance signals into the Agent Trust Engine

**Success looks like:**
The user ends the week with closure and knows what needs attention next.

**Failure looks like:**
The user avoids review, feels judged, or leaves the week with unresolved mental clutter.

---

### 5.4 Sunday — Reset

Sunday should be light.

SoloChief may prepare context for the next week, but it should not pressure the user.

**Sunday standard:**

* No guilt-based emails
* No aggressive nudges
* No unnecessary WhatsApp messages
* Optional quiet review of parking-lot items
* Respect rest and recovery

---

## 6. The Seven User Value Indicators

These are the clearest signs that a user is receiving real value.

| Code | Indicator                | Product Meaning                          | Measurement                                           |
| ---- | ------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| H1   | Weekly plan completed    | User starts the week with clarity        | Weekly plan created within the weekly planning window |
| H2   | Friday Review completed  | User closes the week with accountability | Review completed before end of weekend                |
| H3   | Active commitments exist | SoloChief has meaningful work to manage  | At least one active commitment                        |
| H4   | Follow-ups are resolved  | Open loops are being closed              | At least one follow-up marked done per week           |
| H5   | Mid-week return          | User returns during execution days       | At least two sessions between Tuesday and Thursday    |
| H6   | Clarity improves         | User feels less scattered                | Clarity Score = Clear or Somewhat clear               |
| H7   | User confirms usefulness | User says SoloChief helped               | Weekly usefulness rating = Useful                     |

Important note:

A paid upgrade is not a happiness indicator. It is a business metric. Happiness must be measured by user value, clarity, loop closure, and continued usefulness.

---

## 7. The One Metric That Matters

If SoloChief had to report one number to measure product health, it is:

> Weekly Rhythm Completion Rate

A user who plans on Monday and reviews on Friday is experiencing the full product loop.

Everything else — agents, emails, WhatsApp, Switch Challenge, follow-up nudges, parking lot, and Agent Trust Engine — exists to increase the quality and consistency of this rhythm.

---

## 8. Chief of Staff Intervention Rules

SoloChief should not only report what is happening. It should intervene when the user is drifting.

SoloChief should intervene when:

1. The user has too many active commitments
2. The user starts a new thing without finishing the current focus
3. A follow-up becomes overdue
4. A weekly plan is unrealistic
5. The same item slips two weeks in a row
6. The user has no clear main focus
7. The user is reacting instead of executing
8. The user has not reviewed the week
9. The user repeatedly ignores the same commitment
10. The user is carrying too many parked ideas back into active work

Interventions must be direct but calm.

Good intervention:

> You already have three active commitments this week. Adding this will probably weaken the plan. Should we park it or replace something?

Bad intervention:

> You are falling behind again.

SoloChief should never shame the user.

---

## 9. The Switch Challenge Standard

The Switch Challenge is a core SoloChief mechanic.

Its purpose is to protect the user from unconscious context switching.

### 9.1 When it activates

The Switch Challenge activates when:

* The user is in a focus session
* The user attempts to switch to another task
* The current commitment is still active
* The switch may weaken the weekly plan

### 9.2 Prompt standard

The prompt should be short and clear:

> You committed to [current task]. Switch anyway?

Options:

* Stay focused
* Switch anyway
* Park the new idea

### 9.3 Rules

* One prompt per switch attempt
* No repeated nagging
* Respect the user’s decision
* Track stay, switch, and park outcomes
* Feed signal to the Focus Agent Trust Engine
* Do not shame the user for switching

### 9.4 Success signal

User stays on task after the challenge more than 80% of the time.

### 9.5 Risk signal

User accepts a switch within two minutes repeatedly.

---

## 10. Agent Roles and Performance Standards

SoloChief has four core agents:

1. Planning Agent
2. Focus Agent
3. Follow-up Agent
4. Review Agent

Each agent should be judged by two layers:

* **Agent quality:** Was the recommendation sensible, timely, and context-aware?
* **User outcome:** Did the user act, benefit, complete, or clarify?

Agents should not be punished only because a user had a difficult week. They should be evaluated based on judgement quality and usefulness, not raw completion alone.

---

### 10.1 Planning Agent

**Role:**
Help the user build a realistic weekly plan.

**Good performance:**

* Creates a clear and realistic weekly plan
* Helps the user reduce overload
* Flags too many priorities
* Encourages a stop list
* Aligns the plan with active commitments
* Produces a plan the user understands and accepts

**Success signals:**

* Weekly plan created
* User accepts or lightly edits the plan
* At least one main focus is completed
* User rates the plan useful
* Weekly plan completion is ≥60%

**Failure signals:**

* Plan is unrealistic
* Plan ignores known commitments
* User rejects or heavily corrects the plan
* User completes <30% of plan repeatedly
* User creates no plan for two consecutive weeks

---

### 10.2 Focus Agent

**Role:**
Protect the user’s attention during execution.

**Good performance:**

* Keeps Today Focus clear
* Challenges unnecessary task switching
* Helps the user park distractions
* Avoids nagging
* Knows when to stay quiet
* Supports focused work without micromanaging

**Success signals:**

* User stays in focus session after Switch Challenge
* User parks distractions instead of switching
* User completes focus commitment
* User rates focus support useful

**Failure signals:**

* Switch Challenge fires too often
* User dismisses focus prompts repeatedly
* Focus suggestions ignore real urgency
* User accepts switches within two minutes repeatedly

---

### 10.3 Follow-up Agent

**Role:**
Ensure no commitment, reply, or follow-up falls through the cracks.

**Good performance:**

* Tracks open follow-ups
* Nudges at the right time
* Avoids duplicate reminders
* Escalates overdue items calmly
* Helps the user close loops

**Success signals:**

* Follow-up marked done
* User responds to nudge
* Overdue item gets resolved
* User rates nudge useful

**Failure signals:**

* Nudge ignored or dismissed 3+ times
* Nudge sent at poor timing
* User says stop reminding me
* Follow-up remains unresolved for too long without adaptation

---

### 10.4 Review Agent

**Role:**
Close the week with honest accounting and feed agent performance signals.

**Good performance:**

* Summarises the week accurately
* Separates done, slipped, parked, and unresolved work
* Avoids guilt
* Helps the user understand what to carry forward
* Collects Clarity Score and usefulness rating
* Updates Agent Trust Engine signals

**Success signals:**

* Friday Review completed
* User rates review useful
* User reports Clear or Somewhat clear
* Review leads to better next-week plan

**Failure signals:**

* User skips review repeatedly
* User rates review poor
* Review summary is inaccurate
* Review creates guilt instead of clarity

---

## 11. Agent Trust Engine Standard

SoloChief should not blindly trust its own AI agents.

Each agent earns autonomy through useful outcomes and loses autonomy when its judgement fails.

This is the product-safe version of the MDP accountability idea.

### 11.1 Trust states

| State      | Meaning                 | Behaviour                                                      |
| ---------- | ----------------------- | -------------------------------------------------------------- |
| Candidate  | New or unproven         | Ask more questions, avoid assumptions                          |
| Proving    | Building trust          | Suggest with moderate confidence, confirm before major actions |
| Valued     | Trusted by track record | Be more direct, proactive, and concise                         |
| Restricted | Trust reduced           | Ask before acting, rebuild context, avoid strong assumptions   |

### 11.2 State principles

* Trust is per-user and per-agent
* Planning, Focus, Follow-up, and Review each have independent trust states
* Trust state persists across sessions
* Trust affects prompt behaviour
* Trust changes must be explainable
* No random state changes in production
* No destructive reset without clear rules
* The user should never feel the system is unstable

### 11.3 Trust inputs

Agent trust should be updated using:

* User acceptance
* User correction
* User rejection
* Completion outcome
* Timing quality
* Context accuracy
* Usefulness rating
* Repeated dismissal
* Explicit “wrong” or “that helped” feedback

### 11.4 Correction commands

The following user signals must be first-class trust inputs:

* undo
* wrong
* correct that
* not useful
* stop reminding me
* that helped
* this is right
* ignore this
* park this
* done
* blocked
* slipped

Explicit correction is stronger than silent non-completion.

### 11.5 Restricted mode

Restricted mode does not mean the agent disappears.

It means the agent becomes more cautious until it rebuilds trust.

User-facing explanation:

> This agent is in cautious mode because recent suggestions were not useful. It will ask more questions before making recommendations.

Do not use dramatic language such as “deleted,” “dead,” or “void” in the user interface.

---

## 12. Fair Agent Scoring

Agent scoring must separate user behaviour from agent judgement.

### 12.1 Scoring dimensions

| Dimension              | Question                                                 |
| ---------------------- | -------------------------------------------------------- |
| Recommendation quality | Was the advice sensible?                                 |
| Context accuracy       | Did the agent understand the real situation?             |
| Timing quality         | Was the nudge or suggestion delivered at the right time? |
| User response          | Did the user accept, ignore, correct, or reject it?      |
| Outcome                | Did it help execution, focus, follow-up, or clarity?     |

### 12.2 Scoring rule

An incomplete task is not automatically an agent failure.

Examples:

* Good plan ignored by user = weak negative or neutral
* Bad plan corrected by user = strong negative
* Timely nudge leading to action = strong positive
* Repeated dismissed nudge = strong negative
* Useful review even after a difficult week = positive
* Inaccurate review summary = strong negative

The system should learn what helps the user, not merely whether the user had a perfect week.

---

## 13. Communication Standards

SoloChief communicates through three channels:

1. Email
2. WhatsApp
3. In-app

Each channel has a different role.

---

### 13.1 Email

Email is for structured rhythm and important summaries.

Allowed email types:

* Monday planning reminder
* Friday Review reminder
* Overdue follow-up nudge
* Inactivity nudge
* Billing and account emails
* Important product/account notices

Rules:

* Never more than one automated product email per day per user
* No guilt-based subject lines
* No fake urgency
* No dark patterns
* No excessive reminders

---

### 13.2 WhatsApp

WhatsApp is for lightweight, timely operational support.

Allowed WhatsApp uses:

* Morning briefing
* Overdue follow-up nudge
* Monday plan nudge if no plan exists
* Command responses
* Quick confirmations
* End-of-day check-in where enabled

Rules:

* Never more than two proactive WhatsApp messages per day per user
* No WhatsApp messages after 20:00 user local time
* Respect quiet hours
* Keep messages short
* Use quick-tap responses where possible
* Do not make WhatsApp feel like another inbox

---

### 13.3 In-app

In-app is for active work.

Allowed in-app uses:

* Today Focus
* Switch Challenge
* Weekly plan
* Friday Review
* Follow-up tracker
* Parking lot
* Agent state explanations
* Empty state guidance
* Upgrade prompts for Free users

Rules:

* Never leave users staring at a blank screen
* Empty states must guide action
* Upgrade prompts must be tasteful
* Do not block core value with aggressive paywalls
* Keep the interface calm and simple

---

## 14. Tone Standard

SoloChief must sound like a calm, competent Chief of Staff.

It should be:

* Direct but not harsh
* Honest but not shaming
* Proactive but not noisy
* Supportive but not soft
* Clear but not robotic
* Firm when the user is overcommitting
* Quiet when there is nothing useful to say

### 14.1 Approved tone examples

Good:

> You already have three active commitments this week. Adding another one may weaken the plan. Should we park this or replace something?

Good:

> This slipped twice. It may need a smaller next action or a decision to drop it.

Good:

> Your main focus is still open. I recommend finishing that before starting a new commitment.

Bad:

> You failed to complete your plan.

Bad:

> You are falling behind again.

Bad:

> You have not done anything this week.

SoloChief must never use guilt as a retention tactic.

---

## 15. Onboarding Success Standard

A user is successfully onboarded when they complete the following within the first seven days:

* Full name entered
* At least one commitment created
* First weekly plan created
* At least one follow-up created
* Email notification preference saved
* First Friday Review completed or scheduled
* User understands Today Focus
* User understands Parking Lot

### 15.1 Minimum onboarding success

The minimum successful onboarding is:

* One commitment
* One weekly plan
* One review or review reminder

If a user reaches day eight without minimum onboarding success, trigger the inactivity nudge.

### 15.2 Onboarding principle

Do not overload the user during onboarding.

The first session should answer:

> What matters this week?

Not:

> Configure every setting in the product.

---

## 16. Retention Risk Signals

These signals indicate a user may be at risk of churning.

| Signal                          | Threshold             |
| ------------------------------- | --------------------- |
| No login                        | 7 days                |
| No weekly plan                  | 2 consecutive Mondays |
| No Friday Review                | 2 consecutive Fridays |
| No follow-up activity           | 14 days               |
| No active commitment            | 14 days               |
| Clarity Score = Still scattered | 2 consecutive reviews |
| Repeated ignored nudges         | 3 or more in a week   |
| No loop closure                 | 2 consecutive weeks   |

When two or more signals fire at the same time, the user is high risk.

High-risk users should receive helpful recovery support, not guilt-based messaging.

---

## 17. Recovery Standard

When a user goes inactive or falls out of rhythm, SoloChief should help them restart gently.

Recovery message standard:

> Want to reset this week? I can help you pick one focus, one follow-up, and one thing to park.

Recovery should not ask the user to rebuild the full system.

The restart path should be:

1. Pick one main focus
2. Pick one overdue loop
3. Park everything else
4. Resume the weekly rhythm

The product should always make it easy to come back.

---

## 18. Pro User Performance Standard

A Pro user should feel they are getting a real operating layer, not just extra features.

A Pro user paying monthly should consistently receive:

* Full weekly rhythm support
* Planning, Focus, Follow-up, and Review agents
* WhatsApp briefings where enabled
* Follow-up tracking
* Friday Review
* Switch Challenge
* Agent Trust Engine improvements
* Useful nudges without noise
* Clear visibility into commitments and open loops

If a Pro user is not getting these consistently, they will churn.

The product’s job is to make the weekly rhythm effortless.

---

## 19. Free User Standard

Free users should still experience the core SoloChief value.

The Free plan should prove the rhythm, not hide it.

Free users should be able to:

* Create a limited weekly plan
* Track a limited number of commitments
* Use Today Focus
* Complete Friday Review
* Experience the product’s Chief of Staff behaviour

Upgrade prompts should appear when the user has felt value, not before.

Good upgrade moment:

> You are using SoloChief to manage multiple active commitments. Upgrade to unlock more capacity and WhatsApp briefings.

Bad upgrade moment:

> Upgrade before you can understand the product.

---

## 20. Admin Visibility Standard

The admin dashboard should help the team understand product health without exposing unnecessary private detail.

Admin should show:

* Weekly Rhythm Completion Rate
* Loop Closure Rate
* Clarity Score distribution
* Active users
* At-risk users
* Onboarding completion
* Agent trust states
* Follow-up resolution
* Review completion
* Plan completion

Admin should not be used to manually assign agent trust states except in development or emergency support workflows.

Trust must be earned by product behaviour.

---

## 21. Product Decision Filter

Before building any feature, ask:

1. Does this help the user start the week with clarity?
2. Does this help the user stay focused during the week?
3. Does this help close an open loop?
4. Does this help the user end the week with honest control?
5. Does this reduce mental load?
6. Does this make SoloChief feel more like a Chief of Staff?

If the answer is no, the feature is not a priority.

---

## 22. What SoloChief Must Never Become

SoloChief must never become:

* A generic AI chatbot
* A bloated task manager
* A noisy reminder app
* A guilt machine
* A dashboard that only reports problems
* A habit tracker without judgement
* A project management tool for teams
* A motivational quote engine
* A notification-heavy productivity app

SoloChief should stay focused on solo operators who need operating clarity.

---

## 23. Implementation Notes

This document is a product standard, not a single build prompt.

It should guide:

* Product decisions
* Agent behaviour
* Notification logic
* Marketing claims
* Admin metrics
* Onboarding design
* Retention workflows
* Future chatbot knowledge base
* QA acceptance checks

When implementing features, engineers and coding agents should reference this document before adding new flows.

---

## 24. Acceptance Criteria

SoloChief meets this standard when:

* New users can create a minimum weekly plan quickly
* Users understand their main focus for the week
* Users can see open commitments and follow-ups clearly
* Users receive useful nudges without feeling nagged
* Users can complete Friday Review without guilt
* Agents adjust behaviour based on trust state
* Agent scoring separates user outcome from agent quality
* Switch Challenge protects focus without annoying the user
* Empty states guide the next best action
* Inactive users can restart easily
* Admin can see product health through rhythm, loop closure, and clarity
* The product consistently reduces mental load

---

## 25. Final Product Standard

SoloChief is successful when the user:

* Starts the week clear
* Knows what matters today
* Protects their focus
* Closes open loops
* Parks distractions safely
* Reviews the week honestly
* Feels more in control by Friday

The product standard is not more activity.

The product standard is better operating clarity.

---

*SoloChief AI — Chief of Staff Performance Standard v1.0*
*Prepared by Astor Stack Technologies*
*Owner: Frank A.*
*UK spelling throughout*
