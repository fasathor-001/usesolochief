\# SoloChief UI Principles



\*\*Version:\*\* 1.0

\*\*Status:\*\* Foundation

\*\*Product:\*\* SoloChief AI

\*\*Related documents:\*\*



\* `docs/DESIGN\_DIRECTION.md`

\* `docs/DESIGN\_SYSTEM.md`

\* `docs/COMPONENT\_SYSTEM.md`



\---



\# 1. Purpose



This document defines the behavioural and structural principles behind the SoloChief interface.



`DESIGN\_DIRECTION.md` defines how SoloChief should feel.



`DESIGN\_SYSTEM.md` defines the visual foundations.



This document defines how SoloChief interfaces should behave.



These principles apply to:



\* Marketing pages

\* Authentication

\* Onboarding

\* Command Center

\* Today Focus

\* Follow-ups

\* Weekly planning

\* Friday Review

\* Settings

\* Billing

\* AI recommendations

\* Confirmation flows

\* Correction flows

\* Mobile interfaces



\---



\# 2. Core interface principle



> Every SoloChief screen should reduce the amount of thinking required from the founder.



The interface should not merely display information.



It should help the user understand:



\* What matters

\* What changed

\* What needs attention

\* What can wait

\* What action should happen next



\---



\# 3. One screen, one main question



Every screen must answer one primary question.



Examples:



\### Command Center



> What needs my attention this week?



\### Today Focus



> What should I work on today?



\### Follow-ups



> Who or what am I waiting on?



\### Friday Review



> What moved, slipped, or needs carrying forward?



\### Billing



> What plan am I on and what does it include?



\### Settings



> What can I control here?



If a screen attempts to answer several unrelated questions equally, split or restructure it.



\---



\# 4. One dominant action



Every page area should have one visually dominant action.



Examples:



\* Confirm plan

\* Set today’s focus

\* Add follow-up

\* Complete review

\* Save changes

\* Start free



Secondary actions should be visually quieter.



Do not present several actions with equal visual weight.



\---



\# 5. Hierarchy before decoration



Use hierarchy in this order:



1\. Position

2\. Size

3\. Spacing

4\. Typography

5\. Surface contrast

6\. Colour

7\. Motion



Do not use colour or animation to compensate for weak structure.



\---



\# 6. Calm is functional



SoloChief serves users with too many competing responsibilities.



The interface must not recreate that pressure.



Use:



\* Clear grouping

\* Progressive disclosure

\* Short labels

\* Controlled density

\* Generous spacing

\* Limited actions

\* Strong prioritisation



Avoid:



\* Large grids of equal cards

\* Excessive badges

\* Constant alerts

\* Dense toolbars

\* Repeated status colours

\* Too many visible filters

\* Long explanations before the user can act



\---



\# 7. Cards must not compete equally



A screen should not contain many cards with identical visual weight.



Use:



\* One dominant card

\* One or two supporting cards

\* Lower-priority information beneath

\* Collapsible detail where appropriate



Card size and position must reflect importance.



Do not turn every piece of information into a card.



\---



\# 8. The interface should recommend, not overwhelm



SoloChief should interpret workload.



Preferred:



> These three items deserve attention today.



Avoid:



> You have 27 open items.



Preferred:



> This follow-up is overdue and may block the launch.



Avoid:



> Follow-ups: 7.



Numbers should support decisions rather than replace them.



\---



\# 9. AI actions must be understandable



Whenever SoloChief proposes or performs an AI-assisted action, the interface should make clear:



\* What SoloChief understood

\* What it recommends

\* Why it recommends it

\* What evidence or source it used

\* Whether the action is confirmed

\* Whether the user can change it

\* Whether the action can be undone



AI must not appear magical or invisible.



\---



\# 10. Uncertainty must be visible



SoloChief should not present uncertain interpretations as facts.



When confidence is low or medium:



\* Ask for confirmation

\* Show what was understood

\* Explain what will be changed

\* Provide edit and reject options



Do not overuse confidence percentages.



Use plain language where possible:



\* Confident

\* Needs confirmation

\* Not enough information



\---



\# 11. Correction is a first-class interaction



Users must be able to correct SoloChief without friction.



Supported correction actions should include:



\* Undo

\* Edit

\* Correct that

\* Wrong

\* Restore

\* Reject suggestion



Correction should not feel like an edge case.



The interface should reassure the user that correction improves the current record.



\---



\# 12. Sources should be visible when relevant



When an update came from a specific source, show it when that context matters.



Possible sources:



\* Web

\* WhatsApp

\* User correction

\* AI suggestion

\* Confirmed AI interpretation

\* System-generated reminder



Source information should remain secondary unless trust depends on it.



\---



\# 13. Empty states should teach



An empty state should explain:



1\. What belongs here

2\. Why it matters

3\. What to do next



Preferred:



> No follow-ups are due. Add one when someone owes you a response or action.



Avoid:



> No data available.



Every empty state should include a clear next step when one exists.



\---



\# 14. Loading states should preserve structure



Loading should not cause the page to jump or dramatically change shape.



Use skeletons that reflect the final layout.



Avoid:



\* Full-page spinners for small data requests

\* Layout shifts

\* Fake loading delays

\* Animated loaders that dominate the page



Show progress only when it is meaningful.



\---



\# 15. Error states should help recovery



An error message must explain:



\* What failed

\* Whether anything was saved

\* What the user can do next



Preferred:



> Your focus update was not saved. Try again.



Avoid:



> Something went wrong.



Do not expose technical error details to users.



\---



\# 16. Destructive actions require clarity



Destructive actions must:



\* Use clear language

\* Explain the consequence

\* Require confirmation when the consequence is significant

\* Provide undo when possible



Preferred:



> Delete follow-up



Avoid:



> Confirm action



Button labels should describe the action.



\---



\# 17. Mobile is a priority, not a reduced desktop



Mobile screens should be reorganised based on importance.



On mobile:



\* Primary actions should remain easy to reach

\* Secondary information may collapse

\* Cards may become sections

\* Tables may become lists

\* Navigation may become a drawer or bottom navigation

\* Dense controls should be simplified



Do not simply shrink the desktop layout.



\---



\# 18. Marketing and product must feel connected



The marketing site must use:



\* The same design tokens

\* The same typography character

\* The same button language

\* The same status logic

\* The same screenshot treatment

\* The same tone of voice



Visitors should not feel that they entered a different product after signing in.



\---



\# 19. Use real content wherever possible



Design and test with realistic SoloChief content.



Use:



\* Real founder commitments

\* Realistic follow-ups

\* Real project names

\* Realistic weekly plans

\* Real review outcomes

\* Real WhatsApp messages



Avoid:



\* Lorem ipsum

\* Generic placeholder names

\* Meaningless charts

\* Fake activity

\* Fake testimonials

\* Fake customer logos



\---



\# 20. Copy should be operational



Interface copy should tell the user what is happening.



Preferred:



> Confirm today’s focus.



> Two follow-ups are overdue.



> This will move the task to next week.



> SoloChief understood this as completed.



Avoid:



> Take control of your productivity.



> Unlock powerful insights.



> Supercharge your workflow.



\---



\# 21. Progressive disclosure



Show the minimum information needed for the current decision.



Additional detail should be available through:



\* Expand

\* View details

\* Tooltip

\* Drawer

\* Modal

\* Secondary page



Do not show every field, note, status, and source simultaneously.



\---



\# 22. Tables should remain tables



Use tables for structured comparison.



Do not turn a dashboard into a collection of tables.



Do not turn every table row into a large card on desktop.



On mobile, table data may become a structured list when required for readability.



\---



\# 23. Filters must earn their place



Do not add filters simply because data exists.



A filter is justified when it helps users find or compare meaningful information.



Hide advanced filters until needed.



Default views should already be useful.



\---



\# 24. Status language must remain consistent



Use the approved SoloChief statuses:



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



Do not introduce synonyms such as:



\* Finished

\* Complete

\* Delayed

\* Waiting

\* Pending review



unless the product model explicitly requires them.



\---



\# 25. Components should be reused before extended



Before creating a new component:



1\. Search for an existing approved component.

2\. Check whether a variant can satisfy the need.

3\. Confirm that the new behaviour is reusable.

4\. Document the new variant.

5\. Add tests and stories where applicable.



Do not create one-off components inside page files.



\---



\# 26. Variants must represent meaningful differences



A component variant is justified when behaviour, hierarchy, or meaning changes.



Do not create variants for small visual preferences.



Examples of valid variants:



\* Primary and secondary button

\* Informational and destructive alert

\* Static and interactive card

\* Compact and standard input



Examples of weak variants:



\* Slightly darker card

\* Button with different arbitrary padding

\* Heading with a one-off font size



\---



\# 27. Accessibility is part of component quality



Every component must support:



\* Keyboard interaction

\* Visible focus

\* Accessible names

\* Sufficient contrast

\* Screen readers

\* Reduced motion

\* Touch targets

\* Correct semantic HTML



A component is incomplete until accessibility is verified.



\---



\# 28. Motion must explain change



Use motion to show:



\* Entry

\* Exit

\* Expansion

\* Collapse

\* Progress

\* State change

\* Connection between actions



Do not use motion only to make a page feel active.



No bouncing, pulsing, floating, or glowing unless it communicates a genuine state.



\---



\# 29. Five-second test



When a screen opens, the user should understand within five seconds:



1\. What the screen is for

2\. What deserves attention

3\. What action should happen next

4\. What can be ignored for now

5\. Whether anything requires confirmation



If the answers are unclear, the hierarchy needs revision.



\---



\# 30. Component approval test



A component is ready only when:



\* Its purpose is clear

\* Its states are defined

\* Its variants are limited

\* Its mobile behaviour is defined

\* Its accessibility behaviour is defined

\* It uses approved tokens

\* It does not introduce page-specific styling

\* It can be reused

\* It remains understandable without animation

\* It has realistic content examples



\---



\# 31. Final rule



> SoloChief should make complex work feel organised without pretending the work is simple.



The interface should guide the founder without hiding uncertainty, removing control, or filling every screen with information.



