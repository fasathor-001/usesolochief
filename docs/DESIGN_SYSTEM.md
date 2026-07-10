\# SoloChief Design System



\*\*Version:\*\* 1.0

\*\*Status:\*\* Foundation

\*\*Product:\*\* SoloChief AI

\*\*Company:\*\* Astor Stack Technologies

\*\*Related document:\*\* `docs/DESIGN\_DIRECTION.md`



\---



\# 1. Purpose



This document defines the visual foundations for SoloChief.



It must be read before designing or implementing:



\* Marketing pages

\* Authentication pages

\* Onboarding

\* Dashboard screens

\* Forms

\* Settings

\* Billing

\* Modals

\* WhatsApp demonstrations

\* Product screenshots

\* Emails

\* Empty states

\* Mobile interfaces



The purpose of this system is to prevent individual pages from inventing their own colours, spacing, typography, shadows, and layout rules.



Every new interface should use these approved foundations.



\---



\# 2. Design objective



SoloChief should feel like a competent chief of staff has already organised the founder’s work.



The interface must feel:



\* Calm

\* Clear

\* Structured

\* Decisive

\* Human

\* Premium

\* Trustworthy



The design must not feel:



\* Futuristic

\* Loud

\* Robotic

\* Over-decorated

\* Experimental

\* Like a generic AI SaaS template



\---



\# 3. Foundation rules



1\. Use semantic design tokens.

2\. Do not place raw colour values inside page components.

3\. Do not introduce arbitrary spacing values.

4\. Use one approved typography scale.

5\. Use one approved radius scale.

6\. Use shadows sparingly.

7\. Use teal only for meaning or action.

8\. Use product UI as the main visual asset.

9\. Maintain clear visual hierarchy.

10\. Test every page on desktop and mobile.

11\. Respect reduced-motion preferences.

12\. Do not create one-off styles when an approved pattern exists.



\---



\# 4. Colour system



\## 4.1 Brand colours



\### Midnight 950



```text

\#08111F

```



Use for:



\* Deepest page backgrounds

\* Marketing hero background

\* High-contrast navigation areas



\### Midnight 900



```text

\#0B1422

```



Use for:



\* Main product background

\* Application shell

\* Primary dark surface



\### Midnight 850



```text

\#0E1929

```



Use for:



\* Secondary sections

\* Raised page regions

\* Sidebar surfaces



\### Midnight 800



```text

\#111E30

```



Use for:



\* Cards

\* Panels

\* Inputs

\* Dropdown backgrounds



\### Midnight 750



```text

\#162438

```



Use for:



\* Hovered surfaces

\* Selected dark surfaces

\* Stronger surface separation



\---



\## 4.2 Accent colours



\### Teal 500



```text

\#1BC5BD

```



Primary SoloChief accent.



Use for:



\* Primary buttons

\* Confirmed active states

\* Selected controls

\* Important progress indicators

\* Small brand details

\* Keyboard focus ring



\### Teal 600



```text

\#16AAA3

```



Use for:



\* Primary button hover

\* Pressed controls

\* Stronger active state



\### Teal 400



```text

\#42D4CC

```



Use for:



\* Accent text on dark backgrounds

\* Subtle highlights

\* Non-interactive active indicators



\### Teal soft



```text

rgba(27, 197, 189, 0.12)

```



Use for:



\* Selected background

\* Soft confirmation status

\* Active navigation background

\* Subtle accent panel



\### Teal border



```text

rgba(27, 197, 189, 0.35)

```



Use for:



\* Selected borders

\* Focused panels

\* Soft accent controls



Teal must not be used as a large decorative background.



\---



\## 4.3 Neutral text colours



\### Text primary



```text

\#F8FAFC

```



Use for:



\* Main headings

\* Important values

\* Primary content

\* High-emphasis labels



\### Text secondary



```text

\#CBD5E1

```



Use for:



\* Paragraphs

\* Supporting descriptions

\* Secondary information



\### Text muted



```text

\#94A3B8

```



Use for:



\* Metadata

\* Timestamps

\* Captions

\* Helper text

\* Placeholder text



\### Text subtle



```text

\#64748B

```



Use for:



\* Disabled information

\* Low-emphasis metadata

\* Decorative labels



\### Text inverse



```text

\#08111F

```



Use on:



\* Teal buttons

\* Light backgrounds

\* High-contrast accent surfaces



\---



\## 4.4 Border colours



\### Border subtle



```text

rgba(255, 255, 255, 0.06)

```



Use for:



\* Quiet card borders

\* Section separators

\* Low-emphasis boundaries



\### Border default



```text

rgba(255, 255, 255, 0.10)

```



Use for:



\* Inputs

\* Cards

\* Tables

\* Dropdowns



\### Border strong



```text

rgba(255, 255, 255, 0.16)

```



Use for:



\* Hovered controls

\* Strong separators

\* Selected non-accent elements



Never use bright white borders around every card.



\---



\## 4.5 Semantic colours



\### Success



```text

\#22C55E

```



Soft background:



```text

rgba(34, 197, 94, 0.12)

```



Use for:



\* Completed

\* Confirmed

\* Healthy

\* Successful save



\### Warning



```text

\#F59E0B

```



Soft background:



```text

rgba(245, 158, 11, 0.12)

```



Use for:



\* At risk

\* Partial

\* Due soon

\* Needs review



\### Danger



```text

\#EF4444

```



Soft background:



```text

rgba(239, 68, 68, 0.12)

```



Use for:



\* Destructive actions

\* Errors

\* Overdue

\* Failed operations



\### Information



```text

\#3B82F6

```



Soft background:



```text

rgba(59, 130, 246, 0.12)

```



Use for:



\* Informational notices

\* System updates

\* Neutral guidance



Semantic meaning must never rely on colour alone.



Use:



\* Text

\* Icon

\* Label

\* Position



alongside colour.



\---



\# 5. CSS design tokens



Use these tokens as the initial implementation.



```css

:root {

&#x20; /\* Brand \*/

&#x20; --color-midnight-950: #08111f;

&#x20; --color-midnight-900: #0b1422;

&#x20; --color-midnight-850: #0e1929;

&#x20; --color-midnight-800: #111e30;

&#x20; --color-midnight-750: #162438;



&#x20; --color-teal-400: #42d4cc;

&#x20; --color-teal-500: #1bc5bd;

&#x20; --color-teal-600: #16aaa3;

&#x20; --color-teal-soft: rgba(27, 197, 189, 0.12);

&#x20; --color-teal-border: rgba(27, 197, 189, 0.35);



&#x20; /\* Text \*/

&#x20; --color-text-primary: #f8fafc;

&#x20; --color-text-secondary: #cbd5e1;

&#x20; --color-text-muted: #94a3b8;

&#x20; --color-text-subtle: #64748b;

&#x20; --color-text-inverse: #08111f;



&#x20; /\* Borders \*/

&#x20; --color-border-subtle: rgba(255, 255, 255, 0.06);

&#x20; --color-border-default: rgba(255, 255, 255, 0.1);

&#x20; --color-border-strong: rgba(255, 255, 255, 0.16);



&#x20; /\* Semantic \*/

&#x20; --color-success: #22c55e;

&#x20; --color-success-soft: rgba(34, 197, 94, 0.12);

&#x20; --color-warning: #f59e0b;

&#x20; --color-warning-soft: rgba(245, 158, 11, 0.12);

&#x20; --color-danger: #ef4444;

&#x20; --color-danger-soft: rgba(239, 68, 68, 0.12);

&#x20; --color-info: #3b82f6;

&#x20; --color-info-soft: rgba(59, 130, 246, 0.12);



&#x20; /\* Semantic surfaces \*/

&#x20; --background-page: var(--color-midnight-900);

&#x20; --background-deep: var(--color-midnight-950);

&#x20; --background-section: var(--color-midnight-850);

&#x20; --background-card: var(--color-midnight-800);

&#x20; --background-card-hover: var(--color-midnight-750);

&#x20; --background-input: var(--color-midnight-800);



&#x20; --foreground-primary: var(--color-text-primary);

&#x20; --foreground-secondary: var(--color-text-secondary);

&#x20; --foreground-muted: var(--color-text-muted);

&#x20; --foreground-subtle: var(--color-text-subtle);



&#x20; --border-subtle: var(--color-border-subtle);

&#x20; --border-default: var(--color-border-default);

&#x20; --border-strong: var(--color-border-strong);



&#x20; --accent-primary: var(--color-teal-500);

&#x20; --accent-hover: var(--color-teal-600);

&#x20; --accent-soft: var(--color-teal-soft);

}

```



Page and component files must reference semantic tokens rather than raw brand values wherever possible.



Preferred:



```css

background: var(--background-card);

color: var(--foreground-primary);

border-color: var(--border-default);

```



Avoid:



```css

background: #111e30;

color: #f8fafc;

border-color: rgba(255, 255, 255, 0.1);

```



\---



\# 6. Typography



\## 6.1 Typeface



Primary typeface:



```text

Geist

```



Fallback stack:



```css

font-family:

&#x20; "Geist",

&#x20; "Inter",

&#x20; -apple-system,

&#x20; BlinkMacSystemFont,

&#x20; "Segoe UI",

&#x20; sans-serif;

```



Do not introduce additional typefaces without an explicit design decision.



A monospace font may be used only for:



\* Codes

\* IDs

\* Commands

\* Technical values

\* Developer documentation



\---



\## 6.2 Marketing type scale



\### Display XL



```text

Font size: 80px

Line height: 84px

Weight: 700

Letter spacing: -0.045em

```



Use for:



\* Main desktop marketing headline



Maximum:



\* One per page



\### Display Large



```text

Font size: 64px

Line height: 68px

Weight: 700

Letter spacing: -0.04em

```



Use for:



\* Smaller hero layouts

\* Major campaign statements



\### Display Medium



```text

Font size: 52px

Line height: 58px

Weight: 700

Letter spacing: -0.035em

```



Use for:



\* Marketing section headlines



\### Display Small



```text

Font size: 40px

Line height: 46px

Weight: 650

Letter spacing: -0.03em

```



Use for:



\* Compact feature sections

\* Pricing introduction

\* Footer call to action



\---



\## 6.3 Product type scale



\### Heading 1



```text

Font size: 36px

Line height: 42px

Weight: 650

Letter spacing: -0.025em

```



Use for:



\* Main product page title



\### Heading 2



```text

Font size: 28px

Line height: 34px

Weight: 650

Letter spacing: -0.02em

```



Use for:



\* Major sections

\* Modal title

\* Panel introduction



\### Heading 3



```text

Font size: 22px

Line height: 28px

Weight: 600

Letter spacing: -0.015em

```



Use for:



\* Card title

\* Subsection title



\### Heading 4



```text

Font size: 18px

Line height: 24px

Weight: 600

Letter spacing: -0.01em

```



Use for:



\* Compact group heading

\* List section title



\---



\## 6.4 Body type scale



\### Body large



```text

Font size: 18px

Line height: 29px

Weight: 400

```



Use for:



\* Marketing introduction

\* Important explanations

\* Empty-state copy



\### Body default



```text

Font size: 16px

Line height: 25px

Weight: 400

```



Use for:



\* General interface content

\* Forms

\* Descriptions



\### Body small



```text

Font size: 14px

Line height: 21px

Weight: 400

```



Use for:



\* Secondary information

\* Table support text

\* Compact card descriptions



\### Label



```text

Font size: 13px

Line height: 18px

Weight: 600

Letter spacing: 0

```



Use for:



\* Form labels

\* Navigation

\* Button labels

\* Tabs



\### Caption



```text

Font size: 12px

Line height: 17px

Weight: 500

```



Use for:



\* Timestamps

\* Supporting metadata

\* Status descriptions



Body text must not be smaller than 14px for normal product content.



\---



\## 6.5 Responsive typography



Marketing headline sizes must reduce on smaller screens.



```css

.hero-title {

&#x20; font-size: clamp(3rem, 7vw, 5rem);

&#x20; line-height: 1.02;

&#x20; letter-spacing: -0.045em;

}

```



Recommended ranges:



\### Desktop



```text

Hero: 72px to 80px

Section heading: 44px to 52px

```



\### Tablet



```text

Hero: 52px to 64px

Section heading: 36px to 44px

```



\### Mobile



```text

Hero: 40px to 48px

Section heading: 30px to 36px

```



Do not allow headings to wrap into isolated single words unless intentional.



\---



\## 6.6 Reading width



Paragraphs should not stretch across the full page.



Recommended widths:



```text

Marketing hero copy: 600px maximum

Marketing body copy: 680px maximum

Product descriptions: 640px maximum

Long-form reading: 720px maximum

Form helper text: 480px maximum

```



\---



\# 7. Spacing system



SoloChief uses a four-pixel base with an eight-pixel primary rhythm.



Approved spacing tokens:



```text

2px

4px

8px

12px

16px

20px

24px

32px

40px

48px

64px

80px

96px

128px

160px

```



CSS tokens:



```css

:root {

&#x20; --space-0: 0;

&#x20; --space-0-5: 2px;

&#x20; --space-1: 4px;

&#x20; --space-2: 8px;

&#x20; --space-3: 12px;

&#x20; --space-4: 16px;

&#x20; --space-5: 20px;

&#x20; --space-6: 24px;

&#x20; --space-8: 32px;

&#x20; --space-10: 40px;

&#x20; --space-12: 48px;

&#x20; --space-16: 64px;

&#x20; --space-20: 80px;

&#x20; --space-24: 96px;

&#x20; --space-32: 128px;

&#x20; --space-40: 160px;

}

```



Do not introduce values such as:



```text

17px

23px

37px

53px

```



without a documented reason.



\---



\## 7.1 Default spacing rules



\### Marketing page



```text

Desktop section spacing: 128px

Compact section spacing: 96px

Mobile section spacing: 80px

Hero top and bottom spacing: 96px to 128px

```



\### Product interface



```text

Page padding desktop: 32px

Page padding tablet: 24px

Page padding mobile: 16px

Dashboard section gap: 32px

Card grid gap: 24px

Form field gap: 20px

```



\### Cards



```text

Compact card padding: 16px

Standard card padding: 24px

Large card padding: 32px

Feature panel padding: 40px to 48px

```



\### Text spacing



```text

Eyebrow to heading: 12px

Heading to paragraph: 16px

Paragraph to action: 24px

Page title to page description: 12px

Page header to content: 32px

```



\### Buttons



```text

Icon to label: 8px

Button group gap: 12px

Large CTA group gap: 16px

```



\---



\# 8. Layout and grid



\## 8.1 Marketing container



```text

Maximum width: 1280px

Desktop side padding: 48px

Large desktop side padding: 64px

Tablet side padding: 32px

Mobile side padding: 20px

```



CSS:



```css

.marketing-container {

&#x20; width: min(100% - 40px, 1280px);

&#x20; margin-inline: auto;

}



@media (min-width: 768px) {

&#x20; .marketing-container {

&#x20;   width: min(100% - 64px, 1280px);

&#x20; }

}



@media (min-width: 1200px) {

&#x20; .marketing-container {

&#x20;   width: min(100% - 96px, 1280px);

&#x20; }

}

```



\---



\## 8.2 Product container



```text

Maximum content width: 1440px

Standard page content: 1200px

Reading or settings content: 760px

Form content: 520px

Modal form: 480px to 640px

```



The application shell may span the viewport, but the content inside it should remain controlled.



\---



\## 8.3 Grid



\### Desktop marketing



```text

12 columns

24px gutter

```



\### Tablet



```text

8 columns

20px gutter

```



\### Mobile



```text

4 columns

16px gutter

```



\### Dashboard



Use grid layouts only when information is genuinely comparable.



Avoid filling the page with equal-sized cards.



Preferred hierarchy:



\* One dominant panel

\* One supporting panel

\* Secondary information below

\* Low-priority details progressively disclosed



\---



\## 8.4 Breakpoints



Approved breakpoints:



```css

\--breakpoint-sm: 480px;

\--breakpoint-md: 768px;

\--breakpoint-lg: 1024px;

\--breakpoint-xl: 1280px;

\--breakpoint-2xl: 1536px;

```



Primary behaviour:



\### Below 768px



\* Stack marketing columns

\* Use mobile navigation

\* Disable decorative floating animation

\* Use full-width primary actions where appropriate

\* Reduce card padding

\* Keep touch targets at least 44px



\### From 768px



\* Use tablet layout

\* Allow two-column content where readable

\* Retain generous spacing



\### From 1024px



\* Use full desktop navigation

\* Use dashboard sidebars

\* Use multi-column product layouts



\---



\# 9. Border radius



Approved values:



```text

4px

8px

12px

16px

24px

999px

```



CSS:



```css

:root {

&#x20; --radius-xs: 4px;

&#x20; --radius-sm: 8px;

&#x20; --radius-md: 12px;

&#x20; --radius-lg: 16px;

&#x20; --radius-xl: 24px;

&#x20; --radius-full: 999px;

}

```



Usage:



\### 4px



\* Tiny status markers

\* Compact technical controls



\### 8px



\* Buttons

\* Inputs

\* Selects

\* Small controls



\### 12px



\* Dropdowns

\* Tooltips

\* Compact cards

\* Toasts



\### 16px



\* Standard cards

\* Modals

\* Drawers

\* Product panels

\* WhatsApp demonstration card



\### 24px



\* Large marketing feature panels

\* Large media containers



\### Full radius



Use only for:



\* Avatars

\* Status dots

\* Compact pills

\* Tags

\* Segmented controls



Do not make every card pill-shaped.



\---



\# 10. Borders



Borders should support structure without creating visual noise.



Default card:



```css

border: 1px solid var(--border-subtle);

```



Interactive card:



```css

border: 1px solid var(--border-default);

```



Hover:



```css

border-color: var(--border-strong);

```



Selected:



```css

border-color: var(--color-teal-border);

background: var(--color-teal-soft);

```



Avoid:



\* Double borders

\* Bright outlines

\* Teal borders on every component

\* Thick decorative borders

\* Different border colours without semantic meaning



\---



\# 11. Elevation and shadows



Dark interfaces should rely mainly on:



\* Surface contrast

\* Borders

\* Spacing

\* Layering



Use shadows only when an element visually sits above another layer.



Approved shadows:



```css

:root {

&#x20; --shadow-none: none;



&#x20; --shadow-sm:

&#x20;   0 1px 2px rgba(0, 0, 0, 0.18);



&#x20; --shadow-md:

&#x20;   0 8px 24px rgba(0, 0, 0, 0.22);



&#x20; --shadow-lg:

&#x20;   0 16px 48px rgba(0, 0, 0, 0.3);



&#x20; --shadow-xl:

&#x20;   0 24px 64px rgba(0, 0, 0, 0.4);

}

```



Usage:



\### Small



\* Buttons

\* Raised compact control



\### Medium



\* Dropdowns

\* Popovers

\* Floating menus



\### Large



\* Modals

\* Drawers

\* Important floating panels



\### Extra large



\* Marketing conversation demonstration

\* Large hero media element



Do not use:



\* Teal glows

\* Coloured shadows

\* Permanent glowing borders

\* Multiple heavy shadows on the same element



\---



\# 12. Buttons



\## 12.1 Sizes



\### Small



```text

Height: 36px

Horizontal padding: 14px

Text: 13px, weight 600

Radius: 8px

```



\### Default



```text

Height: 44px

Horizontal padding: 18px

Text: 14px, weight 600

Radius: 8px

```



\### Large



```text

Height: 52px

Horizontal padding: 24px

Text: 15px, weight 600

Radius: 10px

```



All interactive targets should be at least 44px on touch devices.



\---



\## 12.2 Primary button



```text

Background: Teal 500

Text: Midnight 950

Border: none

Hover: Teal 600

```



Use for:



\* Main page action

\* Confirm

\* Save

\* Start free

\* Continue



Only one primary action should dominate each page area.



\---



\## 12.3 Secondary button



```text

Background: Midnight 800

Text: Text primary

Border: Border default

Hover background: Midnight 750

Hover border: Border strong

```



Use for:



\* Secondary action

\* Preview

\* View details

\* Alternative path



\---



\## 12.4 Ghost button



```text

Background: transparent

Text: Text secondary

Border: transparent

Hover background: rgba(255,255,255,0.05)

Hover text: Text primary

```



Use for:



\* Low-emphasis controls

\* Toolbar actions

\* Cancel

\* Navigation actions



\---



\## 12.5 Destructive button



```text

Background: Danger

Text: white

```



Use only for confirmed destructive actions.



Do not use red for normal cancellation.



\---



\## 12.6 Focus state



```css

outline: 2px solid var(--accent-primary);

outline-offset: 2px;

```



Never remove focus styling without providing a visible replacement.



\---



\# 13. Forms



\## 13.1 Input height



```text

Default: 44px

Large onboarding input: 48px

Compact filter input: 36px

```



\## 13.2 Input styling



```text

Background: Midnight 800

Border: Border default

Text: Text primary

Placeholder: Text muted

Radius: 8px

Horizontal padding: 14px

```



Hover:



```text

Border strong

```



Focus:



```text

Teal border

2px teal focus ring

```



Error:



```text

Danger border

Error text below

```



Disabled:



```text

Reduced opacity

Not-allowed cursor

Clear disabled state

```



Form labels must remain visible.



Do not rely on placeholder text as the only label.



\---



\# 14. Cards and surfaces



\## 14.1 Standard card



```text

Background: Midnight 800

Border: Border subtle

Radius: 16px

Padding: 24px

Shadow: none

```



\## 14.2 Interactive card



```text

Background: Midnight 800

Border: Border default

Hover background: Midnight 750

Hover border: Border strong

```



\## 14.3 Selected card



```text

Background: Teal soft

Border: Teal border

```



\## 14.4 Marketing feature panel



```text

Background: Midnight 850 or Midnight 800

Border: Border subtle

Radius: 24px

Padding: 40px to 48px

```



Cards must not all have equal visual weight.



Use hierarchy through:



\* Size

\* Position

\* Typography

\* Surface contrast

\* Spacing



Avoid solving hierarchy by adding more colour.



\---



\# 15. Status system



Approved product status mapping:



\### Planned



```text

Neutral

```



\### Confirmed



```text

Teal

```



\### In progress



```text

Blue

```



\### Done



```text

Green

```



\### Partial



```text

Amber

```



\### Blocked



```text

Red

```



\### Slipped



```text

Amber or red depending on urgency

```



\### Switched



```text

Blue or violet

```



\### Unknown



```text

Grey

```



\### Needs review



```text

Amber

```



Every status must include a readable label.



Do not communicate status only through a coloured dot.



\---



\# 16. Motion



Motion exists to clarify:



\* Entry

\* State change

\* Progress

\* Hierarchy

\* Continuity



Approved durations:



```css

:root {

&#x20; --duration-fast: 120ms;

&#x20; --duration-default: 180ms;

&#x20; --duration-slow: 280ms;

&#x20; --duration-reveal: 420ms;

}

```



Approved easing:



```css

:root {

&#x20; --ease-standard: cubic-bezier(0.2, 0, 0, 1);

&#x20; --ease-enter: cubic-bezier(0, 0, 0.2, 1);

&#x20; --ease-exit: cubic-bezier(0.4, 0, 1, 1);

}

```



Usage:



\### 120ms



\* Button press

\* Hover state

\* Icon response



\### 180ms



\* Dropdown

\* Tooltip

\* Tab change



\### 280ms



\* Modal

\* Drawer

\* Accordion



\### 420ms



\* Marketing section reveal

\* Hero media entry



Avoid:



\* Bouncing

\* Pulsing

\* Continuous rotating

\* Animated gradients

\* Large spring effects

\* Excessive parallax

\* Multiple animation directions



\---



\## 16.1 Reduced motion



All decorative or entrance animation must respect:



```css

@media (prefers-reduced-motion: reduce) {

&#x20; \*,

&#x20; \*::before,

&#x20; \*::after {

&#x20;   scroll-behavior: auto !important;

&#x20;   animation-duration: 0.01ms !important;

&#x20;   animation-iteration-count: 1 !important;

&#x20;   transition-duration: 0.01ms !important;

&#x20; }

}

```



Do not hide content until animation begins.



The page must remain fully understandable without animation.



\---



\# 17. Icons



Approved icon family:



```text

Lucide

```



Rules:



\* Use one icon family.

\* Default stroke width should remain consistent.

\* Use icons primarily for function.

\* Do not place an icon next to every heading.

\* Do not mix filled and outline icon styles arbitrarily.

\* Pair unclear icons with text labels.

\* Use 16px, 18px, 20px, or 24px sizes.



Recommended usage:



```text

16px: metadata and compact controls

18px: buttons

20px: navigation

24px: empty states and feature actions

```



\---



\# 18. Marketing screenshot treatment



Product screenshots should follow one system.



\## Standard treatment



```text

Real product UI

High-resolution capture

Readable text

One clear focal point

Controlled crop

Consistent desktop viewport

Subtle border

16px or 24px radius

No unnecessary perspective

```



Allowed presentation:



\* Flat screenshot

\* Cropped product panel

\* Large browserless product view

\* Real WhatsApp demonstration

\* Close-up of one meaningful interaction



Avoid:



\* Tiny full-dashboard screenshots

\* Fake browser controls

\* Random floating screenshots

\* Excessive 3D tilt

\* Strong reflections

\* Glowing borders

\* Fake data that damages trust



\---



\# 19. Accessibility



Minimum requirements:



\* Normal text contrast: at least 4.5:1

\* Large text contrast: at least 3:1

\* Touch targets: at least 44px

\* Visible keyboard focus

\* All form controls labelled

\* Errors linked to affected inputs

\* Semantic headings

\* Logical tab order

\* Reduced-motion support

\* No information communicated through colour alone

\* Modal focus trapping

\* Escape closes temporary overlays

\* Icon-only controls have accessible names



Accessibility must be verified during implementation, not postponed.



\---



\# 20. Mobile rules



Below 768px:



\* Stack marketing hero columns

\* Centre media only when appropriate

\* Left-align primary text by default

\* Keep side padding at 20px

\* Use full-width primary CTA when it improves usability

\* Disable decorative floating animations

\* Reduce large panel padding

\* Keep product screenshots readable

\* Avoid horizontal scrolling

\* Collapse secondary navigation

\* Keep body text at least 16px where possible

\* Keep controls at least 44px high



Do not simply shrink the desktop page.



Reorder content based on mobile priority.



\---



\# 21. Prohibited implementation patterns



Do not:



\* Add raw hex colours inside page components

\* Use arbitrary Tailwind values repeatedly

\* Introduce new spacing values without updating this system

\* Create duplicate button styles

\* Create page-specific input styling

\* Add new shadows without review

\* Add a second icon family

\* Introduce gradients without a documented reason

\* Use teal as decoration across large surfaces

\* Hide content behind animation

\* Make text smaller to force content into a layout

\* Use excessive uppercase labels

\* Build desktop first and leave mobile unfinished

\* Create new card variants inside page files

\* Remove focus states

\* Use fake social proof

\* Add glassmorphism

\* Use glowing borders

\* Use floating decorative shapes



\---



\# 22. Design review checklist



Before approving a page, verify:



\## Foundation



\* Uses approved colours

\* Uses semantic tokens

\* Uses approved typography

\* Uses approved spacing

\* Uses approved radius

\* Uses approved shadows



\## Hierarchy



\* One clear primary purpose

\* One dominant action

\* Primary content receives the most visual weight

\* Secondary content is visibly quieter

\* Page can be understood within five seconds



\## Consistency



\* Buttons match the system

\* Inputs match the system

\* Cards match approved patterns

\* Icons use the approved family

\* Status colours are consistent

\* Layout widths follow the grid



\## UX



\* Empty states are useful

\* Errors are understandable

\* Loading states are visible

\* Destructive actions are confirmed

\* AI actions can be corrected or undone

\* Mobile layout is intentional



\## Accessibility



\* Keyboard navigation works

\* Focus states are visible

\* Contrast is sufficient

\* Labels are present

\* Touch targets are large enough

\* Motion can be reduced



\## Quality



\* No decorative element competes with the product

\* No section looks like a generic AI template

\* Typography remains readable

\* Spacing feels deliberate

\* The page still works without animation

\* The product UI is doing the visual work



\---



\# 23. Source-of-truth rule



When implementation and this document conflict, stop and review the decision.



Do not silently change the design system to fit an individual page.



A system-level change must be:



1\. Deliberate

2\. Documented

3\. Applied consistently

4\. Reviewed across desktop and mobile



\---



\# 24. Final standard



SoloChief’s interface should feel quiet before it feels impressive.



It should feel structured before it feels decorative.



It should make the next action obvious.



It should show the user what SoloChief knows, what it recommends, and what still needs confirmation.



Every visual decision should support clarity, focus, or trust.



