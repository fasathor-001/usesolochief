\# SoloChief Component System



\*\*Version:\*\* 1.0

\*\*Status:\*\* Specification

\*\*Product:\*\* SoloChief AI

\*\*Related documents:\*\*



\* `docs/DESIGN\_DIRECTION.md`

\* `docs/DESIGN\_SYSTEM.md`

\* `docs/UI\_PRINCIPLES.md`



\---



\# 1. Purpose



This document defines the approved reusable components for SoloChief.



It specifies:



\* Purpose

\* Variants

\* Sizes

\* States

\* Behaviour

\* Accessibility

\* Mobile behaviour

\* Reuse rules



The goal is to prevent every page from designing its own controls, cards, alerts, navigation, and AI interactions.



\---



\# 2. Component naming



Use clear component names.



Preferred:



```text

Button

Input

StatusBadge

FocusCard

AISuggestionCard

ConfirmationBanner

```



Avoid vague names:



```text

Box

Container2

FancyCard

SpecialButton

Widget

```



Component names should describe responsibility rather than visual appearance.



\---



\# 3. Component categories



The SoloChief UI Kit contains:



1\. Actions

2\. Form controls

3\. Navigation

4\. Data display

5\. Feedback

6\. Overlays

7\. Layout

8\. SoloChief product components

9\. AI trust components

10\. Marketing components



\---



\# 4. Actions



\## 4.1 Button



\### Purpose



Trigger an action or navigation.



\### Variants



\* Primary

\* Secondary

\* Ghost

\* Destructive

\* Text

\* Icon only



\### Sizes



\* Small

\* Default

\* Large



\### Required states



\* Default

\* Hover

\* Focus

\* Active

\* Disabled

\* Loading



\### Rules



\* One dominant primary button per page area

\* Button labels should describe the action

\* Do not use “Submit” when a clearer label exists

\* Loading buttons retain their width

\* Disabled buttons require a visible explanation when the reason is unclear

\* Icon-only buttons require an accessible label



\### Example labels



\* Confirm plan

\* Save changes

\* Add follow-up

\* Start free

\* Delete commitment

\* Undo update



\---



\## 4.2 ButtonGroup



\### Purpose



Group closely related actions.



\### Variants



\* Horizontal

\* Vertical

\* Responsive

\* Segmented



\### Rules



\* Primary action appears first visually

\* Destructive action should not sit directly beside the primary action without separation

\* Stack on mobile when labels become cramped



\---



\## 4.3 QuickAction



\### Purpose



Provide a compact action for common SoloChief updates.



\### Examples



\* Done

\* Partial

\* Blocked

\* Slipped

\* Switch

\* Park



\### Rules



\* Must include text

\* May include an icon

\* Must map to an approved product state

\* Should not rely only on colour

\* Must provide confirmation where the action changes important records



\---



\# 5. Form controls



\## 5.1 TextInput



\### Variants



\* Default

\* Search

\* With leading icon

\* With trailing action

\* Error

\* Disabled



\### Required elements



\* Visible label

\* Optional helper text

\* Error message

\* Input control



\### States



\* Default

\* Hover

\* Focus

\* Filled

\* Error

\* Disabled

\* Read only



\### Rules



\* Placeholder is not a label

\* Error message must explain recovery

\* Input height follows the design system

\* Avoid unnecessary icons



\---



\## 5.2 Textarea



\### Purpose



Longer user input.



\### Uses



\* Blocker note

\* Review reflection

\* Follow-up details

\* Correction reason

\* Commitment description



\### Rules



\* Minimum visible height should support three lines

\* Show character count only when a meaningful limit exists

\* Preserve entered content after recoverable errors



\---



\## 5.3 Select



\### Variants



\* Single select

\* Searchable

\* Multi-select only when necessary



\### Rules



\* Native select is acceptable for simple mobile flows

\* Selected value must remain visible

\* Options should use plain language

\* Avoid multi-select for fewer than three meaningful options



\---



\## 5.4 Checkbox



Use for independent choices.



Do not use checkboxes for mutually exclusive choices.



Required states:



\* Unchecked

\* Checked

\* Indeterminate

\* Focus

\* Disabled

\* Error



\---



\## 5.5 RadioGroup



Use for mutually exclusive decisions.



Examples:



\* Permission level

\* Communication preference

\* Planning style



Rules:



\* Display all reasonable choices when there are few options

\* Do not hide important consequences inside tooltips



\---



\## 5.6 Toggle



Use for immediate binary settings.



Examples:



\* Midday check-in

\* Friday review reminder

\* Quiet hours

\* WhatsApp updates



Rules:



\* Label must explain the setting

\* Current state must be understandable

\* Avoid using toggles for actions requiring confirmation



\---



\## 5.7 DateInput



Use for:



\* Follow-up dates

\* Due dates

\* Review periods

\* Reminder dates



Rules:



\* Support keyboard entry

\* Use clear regional date formatting

\* Show the selected date in plain language where useful

\* Do not force a calendar interaction for every date



\---



\## 5.8 TimeInput



Use for:



\* Morning brief

\* Midday check-in

\* End-of-day check-in

\* Quiet hours



Rules:



\* Respect user timezone

\* Display timezone context when ambiguity exists

\* Support keyboard input



\---



\## 5.9 SearchInput



Purpose:



Find items within lists.



Rules:



\* Use a search icon

\* Provide clear placeholder

\* Include a clear control when filled

\* Do not display search when the dataset is too small to justify it



\---



\# 6. Navigation



\## 6.1 MarketingHeader



Contains:



\* SoloChief logo

\* Product navigation

\* Sign in

\* Primary CTA

\* Mobile menu control



Rules:



\* Keep navigation minimal

\* Sticky behaviour is optional

\* Do not place every page in the primary navigation

\* Mobile menu must be keyboard accessible



\---



\## 6.2 AppSidebar



Contains:



\* Product identity

\* Primary navigation

\* Secondary navigation

\* User or organisation menu



Required states:



\* Default

\* Hover

\* Active

\* Focus

\* Collapsed where supported



Rules:



\* Active location must be clear

\* Do not use badges on every navigation item

\* Keep primary workflows near the top

\* Mobile uses a drawer rather than a permanently narrow sidebar



\---



\## 6.3 AppHeader



Contains where relevant:



\* Mobile menu

\* Current page context

\* Search or command trigger

\* Notifications

\* User menu



Rules:



\* Avoid duplicating page headings unnecessarily

\* Header should not become a toolbar for unrelated controls



\---



\## 6.4 Breadcrumb



Use for deep hierarchy only.



Do not use breadcrumbs on shallow dashboard pages.



\---



\## 6.5 Tabs



Use to switch between closely related views.



Required states:



\* Default

\* Hover

\* Focus

\* Active

\* Disabled



Rules:



\* Active tab must remain visible without relying only on colour

\* Use horizontal scrolling on mobile when required

\* Do not use tabs for sequential onboarding



\---



\## 6.6 Pagination



Use for large datasets.



Rules:



\* Preserve filters during navigation

\* Show previous and next actions

\* Do not paginate small datasets unnecessarily



\---



\# 7. Data display



\## 7.1 Card



\### Variants



\* Standard

\* Interactive

\* Selected

\* Muted

\* Feature

\* Warning

\* Destructive



\### Rules



\* Cards should group related content

\* Do not place every page element inside a card

\* Interactive cards require clear hover and focus states

\* Selected cards use approved accent treatment

\* Avoid nested cards unless hierarchy requires it



\---



\## 7.2 MetricCard



Purpose:



Display one important value with context.



Contains:



\* Label

\* Value

\* Optional comparison

\* Optional supporting note



Rules:



\* A metric must support a decision

\* Do not create a dashboard full of equal metric cards

\* Avoid decorative charts with no actionable meaning



\---



\## 7.3 Badge



Purpose:



Compact metadata.



Examples:



\* Pro

\* Web

\* WhatsApp

\* New

\* Draft



Rules:



\* Do not use badges for major actions

\* Limit the number visible in one area

\* Badge colour must have meaning



\---



\## 7.4 StatusBadge



Uses approved SoloChief statuses:



\* Planned

\* Confirmed

\* In progress

\* Done

\* Partial

\* Blocked

\* Slipped

\* Switched

\* Unknown

\* Needs review



Contains:



\* Status label

\* Optional icon

\* Semantic colour treatment



Rules:



\* Always include readable text

\* Do not create alternative labels without changing the product model



\---



\## 7.5 Avatar



Variants:



\* Image

\* Initials

\* SoloChief system avatar

\* Group



Sizes:



\* 24px

\* 32px

\* 40px

\* 48px



Rules:



\* Provide text alternative where meaningful

\* Initials must remain readable

\* Avoid decorative avatars where identity is irrelevant



\---



\## 7.6 Table



Contains:



\* Header

\* Rows

\* Optional selection

\* Optional sorting

\* Optional actions



Rules:



\* Use for comparison and scanning

\* Keep row actions predictable

\* Sticky headers may be used for long tables

\* On mobile, convert to a structured list when necessary

\* Never hide essential information only on hover



\---



\## 7.7 ListItem



Purpose:



Reusable row for commitments, follow-ups, reviews, and activity.



Contains:



\* Primary label

\* Secondary context

\* Status

\* Optional metadata

\* Optional action



Rules:



\* Entire row may be interactive only when the destination is clear

\* Actions must remain keyboard accessible



\---



\## 7.8 Divider



Use sparingly to separate related regions.



Prefer spacing over repeated lines.



\---



\# 8. Feedback



\## 8.1 Alert



Variants:



\* Information

\* Success

\* Warning

\* Error



Contains:



\* Optional icon

\* Title

\* Description

\* Optional action

\* Optional dismiss control



Rules:



\* Alerts communicate meaningful state

\* Avoid persistent success alerts for routine actions

\* Error alerts explain recovery



\---



\## 8.2 Toast



Use for temporary confirmation.



Examples:



\* Focus updated

\* Follow-up added

\* Change undone



Rules:



\* Do not place important instructions only in a toast

\* Toast must not block main controls

\* Provide undo where useful

\* Pause dismissal on hover where appropriate



\---



\## 8.3 InlineError



Use beside the affected field or action.



Must explain:



\* What is wrong

\* How to fix it



\---



\## 8.4 EmptyState



Contains:



\* Optional restrained icon

\* Clear title

\* Short explanation

\* Primary next action

\* Optional secondary action



Rules:



\* Explain what belongs here

\* Explain why it matters

\* Avoid decorative illustrations unless uniquely designed



\---



\## 8.5 Skeleton



Variants:



\* Text

\* Card

\* List

\* Table

\* Dashboard section



Rules:



\* Match the final layout

\* Avoid excessive shimmer

\* Respect reduced-motion preference

\* Do not show a skeleton for instant interactions



\---



\## 8.6 Spinner



Use only for compact actions or indeterminate operations.



Do not use a large page spinner when skeletons are possible.



\---



\## 8.7 ProgressBar



Use for measurable progress.



Examples:



\* Onboarding

\* Weekly review completion

\* Checklist progress



Rules:



\* Include a readable label or value

\* Do not use progress bars for vague AI processes



\---



\# 9. Overlays



\## 9.1 Modal



Use for:



\* Focused decisions

\* Confirmations

\* Short forms

\* Important review steps



Required behaviour:



\* Focus trap

\* Escape to close where safe

\* Return focus to trigger

\* Accessible title

\* Body scroll lock

\* Responsive mobile layout



Rules:



\* Do not place long workflows inside a modal

\* Destructive confirmation must describe the consequence



\---



\## 9.2 Drawer



Use for:



\* Mobile navigation

\* Supporting detail

\* Filters

\* Contextual editing



Rules:



\* Do not use a drawer when a full page is clearer

\* Mobile drawers should use most of the available width

\* Focus and escape behaviour must be accessible



\---



\## 9.3 DropdownMenu



Use for compact secondary actions.



Rules:



\* Do not hide the primary action in a dropdown

\* Menu items require visible focus

\* Destructive items should be separated and labelled clearly



\---



\## 9.4 Tooltip



Use for short clarification.



Rules:



\* Do not place essential information only in a tooltip

\* Must work with keyboard focus

\* Keep content brief

\* Avoid tooltips on touch-only actions



\---



\## 9.5 Popover



Use for lightweight interactive content.



Examples:



\* Date picker

\* Small filter

\* Status selection

\* Supporting context



Popover must have a clear trigger and dismissal behaviour.



\---



\# 10. Layout components



\## 10.1 MarketingContainer



Maximum width and padding must follow `DESIGN\_SYSTEM.md`.



\---



\## 10.2 AppShell



Contains:



\* Sidebar

\* Header

\* Main content

\* Mobile navigation behaviour



Rules:



\* Application shell remains consistent across product pages

\* Page components must not recreate the shell



\---



\## 10.3 PageHeader



Contains:



\* Optional eyebrow or breadcrumb

\* Page title

\* Description

\* Primary action

\* Optional secondary actions



Rules:



\* One primary action

\* Description should remain short

\* Mobile actions may stack



\---



\## 10.4 SectionHeader



Contains:



\* Section title

\* Optional description

\* Optional action



Use within product pages.



\---



\## 10.5 Stack



Reusable vertical or horizontal spacing layout.



Approved gaps must reference spacing tokens.



\---



\## 10.6 Grid



Use approved responsive columns and gaps.



Do not use arbitrary page-specific grid spacing.



\---



\# 11. SoloChief product components



These components create the distinct SoloChief product language.



\## 11.1 TodayFocusCard



\### Purpose



Show the founder’s primary outcome for today.



Contains:



\* Date

\* Primary outcome

\* Supporting tasks

\* Confirmation state

\* Progress state

\* Optional blocker

\* Main action



Variants:



\* Proposed

\* Confirmed

\* In progress

\* Done

\* Blocked

\* Needs review



Rules:



\* Must be the dominant element on Today Focus

\* Do not overload with unrelated metrics

\* Support confirm, update, and correct actions

\* Keep supporting tasks limited



\---



\## 11.2 WeeklyPlanCard



\### Purpose



Present a weekly commitment or outcome.



Contains:



\* Commitment title

\* Product or category

\* Stage

\* Permission level

\* Weekly outcome

\* Status

\* Capacity context

\* Actions



Variants:



\* Active

\* At risk

\* Parked

\* Completed

\* Needs confirmation



\---



\## 11.3 MorningBriefCard



\### Purpose



Summarise what matters at the start of the day.



Contains:



\* Greeting

\* Primary focus

\* Important follow-ups

\* Risk or blocker

\* Recommended action

\* Timestamp or delivery context



Rules:



\* Keep concise

\* Do not repeat the entire dashboard

\* Support quick actions



\---



\## 11.4 FollowUpCard



Contains:



\* Person or organisation

\* Required action

\* Due date

\* Status

\* Context

\* Source

\* Actions



Variants:



\* Due today

\* Upcoming

\* Waiting

\* Overdue

\* Completed



Rules:



\* Due state must be easy to scan

\* Overdue treatment must not overwhelm the whole interface

\* Support reschedule, complete, and edit



\---



\## 11.5 StopListCard



Purpose:



Show work the founder has explicitly decided not to touch.



Contains:



\* Item

\* Reason

\* Review date

\* Risk of reopening

\* Restore action



Rules:



\* Stop List should feel protective, not punitive

\* Reopening should require a reason when product rules demand it



\---



\## 11.6 ParkingLotCard



Contains:



\* Idea or commitment

\* Date parked

\* Reason

\* Related product

\* Review timing

\* Restore or trade action



Rules:



\* Clearly distinguish parked from abandoned

\* Explain the trade-off when restoring midweek



\---



\## 11.7 LaunchChecklistCard



Contains:



\* Checklist title

\* Maximum item count

\* Completed count

\* Current items

\* Swap action

\* Status



Rules:



\* Enforce the ten-item cap visibly

\* Explain the swap rule

\* Do not hide capacity limits



\---



\## 11.8 FridayReviewSummary



Contains:



\* Planned

\* Done

\* Partial

\* Blocked

\* Slipped

\* Switched

\* Lessons

\* Carryover

\* Next action



Rules:



\* Tell the story of the week

\* Do not reduce the review to metrics alone

\* Highlight patterns without accusation



\---



\## 11.9 CommitmentCard



Contains:



\* Commitment title

\* Category

\* Stage

\* Permission level

\* Current status

\* Next important outcome

\* Last update



Rules:



\* Make project context clear

\* Avoid showing every stored field

\* Support detail expansion



\---



\## 11.10 AttentionAlert



Purpose:



Surface a meaningful conflict, risk, or repeated pattern.



Examples:



\* Too many active priorities

\* Repeated switching

\* Follow-up overdue

\* Commitment reopened after stopping

\* No progress evidence



Variants:



\* Informational

\* Needs attention

\* High risk



Rules:



\* Must explain why it matters

\* Must recommend a next action

\* Must not shame the user

\* Avoid alert fatigue



\---



\# 12. AI trust components



\## 12.1 AISuggestionCard



Contains:



\* Suggested action

\* Short rationale

\* Source or evidence

\* Confidence language

\* Confirm

\* Edit

\* Reject



Rules:



\* The proposed change must be explicit

\* User action must be clear

\* Do not use AI decoration or sparkle icons by default



\---



\## 12.2 ConfirmationBanner



Purpose:



Ask the user to confirm an interpretation before writing it.



Contains:



\* What SoloChief understood

\* What will change

\* Confirm action

\* Edit action

\* Reject action



Variants:



\* High confidence

\* Needs confirmation

\* Low confidence



Rules:



\* Plain language

\* No automatic countdown

\* Do not visually pressure confirmation



\---



\## 12.3 CorrectionBanner



Purpose:



Show that a previous interpretation was corrected.



Contains:



\* Previous value

\* Corrected value

\* Source

\* Timestamp

\* Undo where appropriate



Rules:



\* Keep correction history understandable

\* Do not imply blame



\---



\## 12.4 SourceBadge



Approved sources:



\* Web

\* WhatsApp

\* User corrected

\* System inferred

\* AI suggested

\* AI confirmed



Rules:



\* Secondary visual treatment

\* Show only when context or trust benefits

\* Never replace a written explanation



\---



\## 12.5 ConfidenceIndicator



Preferred labels:



\* Confident

\* Needs confirmation

\* Not enough information



Rules:



\* Avoid precise percentages in normal user flows

\* Confidence colour must include text

\* Do not create false precision



\---



\## 12.6 DecisionCard



Contains:



\* Decision

\* Reason

\* Date

\* Source

\* Related commitment

\* Consequence

\* Edit or reverse action where allowed



Purpose:



Preserve meaningful operational decisions.



\---



\## 12.7 UndoToast



Purpose:



Confirm an action while allowing immediate reversal.



Examples:



\* Follow-up completed

\* Focus changed

\* Item parked

\* Plan confirmed



Rules:



\* Undo must restore the prior valid state

\* Do not show undo for irreversible deletion unless recovery exists



\---



\# 13. Marketing components



\## 13.1 MarketingHero



Contains:



\* Eyebrow where needed

\* Main promise

\* Supporting explanation

\* Primary CTA

\* Secondary CTA

\* Product demonstration

\* Optional trust note



Rules:



\* One promise

\* Product demonstration supports the message

\* Hero should be understandable without animation

\* Avoid generic decorative art



\---



\## 13.2 ProductDemonstration



Variants:



\* Command Center

\* Today Focus

\* WhatsApp conversation

\* Follow-up flow

\* Friday Review



Rules:



\* Use real or production-faithful UI

\* Maintain readable scale

\* One focal interaction

\* Avoid excessive perspective or floating screens



\---



\## 13.3 FeatureNarrative



Contains:



\* Short heading

\* Brief explanation

\* Product visual

\* Optional supporting detail



Rules:



\* One idea per section

\* Alternate layout only when it improves flow

\* Avoid repetitive icon grids



\---



\## 13.4 Testimonial



Contains:



\* Real quote

\* Real name

\* Role

\* Organisation where approved

\* Optional photograph



Rules:



\* Never invent

\* Keep quote specific

\* Avoid generic praise



\---



\## 13.5 PricingCard



Contains:



\* Plan name

\* Price

\* Ideal user

\* Included features

\* Limits

\* CTA

\* Optional recommendation label



Rules:



\* Differences must be clear

\* Limits must not be hidden

\* Do not artificially weaken lower plans

\* One plan may be recommended, but without excessive visual manipulation



\---



\## 13.6 FinalCTA



Contains:



\* One clear statement

\* Primary action

\* Optional low-risk note



Rules:



\* Do not introduce new product claims

\* Keep one primary action



\---



\# 14. Required component states



Every interactive component must consider:



\* Default

\* Hover

\* Focus

\* Active

\* Disabled

\* Loading

\* Error where applicable

\* Empty where applicable

\* Selected where applicable



Do not document only the ideal state.



\---



\# 15. Component implementation rules



1\. Components must use design tokens.

2\. Components must not contain raw brand colours.

3\. Components must not use arbitrary spacing repeatedly.

4\. Components must support class or variant composition cleanly.

5\. Components must not include page-specific business logic.

6\. Product components may compose generic components.

7\. Accessibility is mandatory.

8\. Mobile behaviour must be explicit.

9\. Components must support realistic content.

10\. Components must not rely on animation to remain understandable.



\---



\# 16. Story or preview requirements



Each component should have a preview or story showing:



\* Default

\* Variants

\* States

\* Long content

\* Short content

\* Mobile width

\* Keyboard focus

\* Error or empty states where applicable



Product components should use realistic SoloChief content.



\---



\# 17. Testing requirements



Test where relevant:



\* Rendering

\* Keyboard interaction

\* Focus management

\* Accessible name

\* Disabled behaviour

\* Loading behaviour

\* Action callbacks

\* Modal and drawer focus

\* Status mapping

\* Reduced motion

\* Responsive behaviour



Visual review remains required even when tests pass.



\---



\# 18. Initial implementation priority



Build in this order.



\## Priority 1: Foundations



\* Button

\* IconButton

\* TextInput

\* Textarea

\* Select

\* Checkbox

\* RadioGroup

\* Toggle

\* Badge

\* StatusBadge

\* Card

\* Alert



\## Priority 2: Structure



\* MarketingContainer

\* AppShell

\* AppSidebar

\* AppHeader

\* PageHeader

\* SectionHeader

\* Tabs

\* Modal

\* Drawer

\* DropdownMenu

\* Tooltip



\## Priority 3: Feedback



\* Toast

\* InlineError

\* EmptyState

\* Skeleton

\* Spinner

\* ProgressBar



\## Priority 4: SoloChief identity



\* TodayFocusCard

\* WeeklyPlanCard

\* MorningBriefCard

\* FollowUpCard

\* StopListCard

\* ParkingLotCard

\* FridayReviewSummary

\* AttentionAlert



\## Priority 5: AI trust



\* AISuggestionCard

\* ConfirmationBanner

\* CorrectionBanner

\* SourceBadge

\* ConfidenceIndicator

\* DecisionCard

\* UndoToast



\## Priority 6: Marketing



\* MarketingHero

\* ProductDemonstration

\* FeatureNarrative

\* Testimonial

\* PricingCard

\* FinalCTA



\---



\# 19. Component rejection criteria



Reject a component when:



\* It introduces raw colours

\* It introduces arbitrary spacing

\* It duplicates an existing component

\* It lacks focus styling

\* Its mobile behaviour is missing

\* It has unclear naming

\* It has excessive variants

\* It depends on decorative animation

\* It uses generic AI styling

\* It cannot support realistic content

\* It hides important information on hover

\* It does not explain errors

\* It cannot be reused



\---



\# 20. Final standard



A SoloChief component should look calm, behave predictably, and explain its state clearly.



Generic components should provide consistency.



Product components should make SoloChief recognisable.



AI trust components should make the system understandable and correctable.



No page should need to invent its own UI language.



