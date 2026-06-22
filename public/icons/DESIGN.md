---
name: Midnight Tech
colors:
  surface: '#0e1513'
  surface-dim: '#0e1513'
  surface-bright: '#333b38'
  surface-container-lowest: '#09100e'
  surface-container-low: '#161d1b'
  surface-container: '#1a211f'
  surface-container-high: '#242b29'
  surface-container-highest: '#2f3634'
  on-surface: '#dde4e1'
  on-surface-variant: '#bbcac4'
  inverse-surface: '#dde4e1'
  inverse-on-surface: '#2b3230'
  outline: '#85948f'
  outline-variant: '#3c4a46'
  surface-tint: '#41ddc2'
  primary: '#42dec3'
  on-primary: '#00382f'
  primary-container: '#00c2a8'
  on-primary-container: '#00493e'
  inverse-primary: '#006b5c'
  secondary: '#9dd1c4'
  on-secondary: '#00382f'
  secondary-container: '#1b4f45'
  on-secondary-container: '#8cbfb2'
  tertiary: '#ffb6a0'
  on-tertiary: '#5e1700'
  tertiary-container: '#ff8d69'
  on-tertiary-container: '#752509'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#65fade'
  primary-fixed-dim: '#41ddc2'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005045'
  secondary-fixed: '#b8eddf'
  secondary-fixed-dim: '#9dd1c4'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#1b4f45'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7e2c0f'
  background: '#0e1513'
  on-background: '#dde4e1'
  surface-variant: '#2f3634'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  code-inline:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for a high-performance, developer-centric environment where clarity and visual focus are paramount. It utilizes a **Minimalist-Modern** aesthetic adapted for deep-focus dark environments. The experience is designed to feel high-tech, precise, and sophisticated, reducing eye strain through a dark-first approach.

The interface prioritizes functional aesthetics—leveraging whitespace even in a dark context—to create a sense of breathability. By combining sharp typography with vibrant teal accents, the design system creates a powerful visual hierarchy that directs the user's attention to primary actions without overwhelming the senses.

## Colors

The palette is centered on a deep **Midnight Blue** base, providing a high-contrast environment for information display. 

- **Primary (Electric Teal):** Reserved for call-to-actions, active states, and critical paths. It provides maximum contrast against the dark background.
- **Background (Midnight Blue):** The foundational layer.
- **Neutral (Off-white):** Used for primary body text to ensure maximum readability while avoiding the harshness of pure white.
- **Surfaces:** UI elevation is achieved by lightening the base blue, creating "Surface Low" and "Surface High" containers that pull elements closer to the user.

## Typography

The design system utilizes **Geist** for its entire type scale. Geist’s technical, geometric nature reinforces the developer-friendly persona of the interface.

- **Headlines:** Use Semi-Bold or Bold weights with slightly tightened letter spacing to maintain a compact, high-impact feel.
- **Body Text:** Set in the Regular weight at 16px to ensure optimal legibility for long-form content against the dark background.
- **Mono-characteristics:** Use the built-in monospaced features of Geist for data-heavy sections or IDs to emphasize the technical theme.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

- **Spacing Rhythm:** Based on an 8px modular scale. All padding, margins, and component heights should be multiples of 8.
- **Vertical Spacing:** Use generous vertical margins (48px - 64px) between major sections to prevent the dark UI from feeling claustrophobic.
- **Margins:** Desktop views should maintain a 40px outer margin, while mobile views shrink to 16px to maximize screen real estate.

## Elevation & Depth

In this dark theme, depth is communicated through **Tonal Layers** rather than shadows. Shadows are often lost on deep blue backgrounds, so we use background-lightness to denote hierarchy.

1. **Level 0 (Base):** #0F1B2D (The main canvas).
2. **Level 1 (Cards/Containers):** #16253A (For standard content groupings).
3. **Level 2 (Modals/Popovers):** #1D2E45 (The highest surface, appearing closest to the user).

**Borders:** Use subtle 1px outlines (#243B55) for all containers to ensure they are clearly defined against the base background. Do not use heavy shadows; if needed, use a very soft 15% opacity black shadow to add a subtle lift.

## Shapes

The design system utilizes **Rounded** shapes (0.5rem base) to soften the technical edge of the Geist typeface and the dark color palette.

- **Standard Elements:** 0.5rem (8px) for buttons, input fields, and small cards.
- **Large Elements:** 1rem (16px) for main content containers and modal windows.
- **Pills:** Used exclusively for status indicators (Chips/Tags) to differentiate them from interactive buttons.

## Components

- **Buttons:** Primary buttons use a solid Electric Teal (#00C2A8) background with a dark navy text (#0F1B2D) for maximum readability. Secondary buttons should use a ghost style with an Electric Teal border.
- **Input Fields:** Use the "Surface Low" background with a 1px border. On focus, the border transitions to Electric Teal.
- **Cards:** Defined by a 1px border (#243B55) and a slightly lighter background than the canvas.
- **Chips:** Small, pill-shaped elements with a low-opacity Electric Teal tint (15% alpha) for background and solid Teal for text.
- **Lists:** Separated by thin 1px horizontal lines using the border color. Ensure ample padding (12px-16px) between list items.
- **Checkboxes/Radios:** When checked, they fill with Electric Teal. Unchecked states use the subtle border color to remain unobtrusive.