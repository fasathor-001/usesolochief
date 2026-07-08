---
name: SoloChief Executive
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bbcac4'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#85948f'
  outline-variant: '#3c4a46'
  surface-tint: '#41ddc2'
  primary: '#42dec3'
  on-primary: '#00382f'
  primary-container: '#00c2a8'
  on-primary-container: '#00493e'
  inverse-primary: '#006b5c'
  secondary: '#bbc7df'
  on-secondary: '#253144'
  secondary-container: '#3e495e'
  on-secondary-container: '#adb9d1'
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
  secondary-fixed: '#d7e3fc'
  secondary-fixed-dim: '#bbc7df'
  on-secondary-fixed: '#101c2e'
  on-secondary-fixed-variant: '#3c475b'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7e2c0f'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is engineered for high-performance solo founders and executives who require operational clarity and an atmosphere of focused authority. The aesthetic is rooted in **Minimalism** with a heavy emphasis on structural precision and "dark-room" focus. 

The emotional response should be one of calm confidence—reducing the cognitive load of complex data through expansive whitespace and a strict hierarchical order. By stripping away extraneous decoration and "bubbly" trends, the interface adopts a utilitarian yet premium feel that mirrors the efficiency of an executive command center.

## Colors
This design system utilizes a high-contrast, dark-mode-first palette to ensure maximum legibility and reduced eye strain during long operational sessions.

- **Primary Background (#0F1B2D):** An deep Midnight Blue that provides a solid, stable foundation for the interface.
- **Electric Teal Accent (#00C2A8):** Reserved strictly for primary actions, success states, and progress indicators. It acts as a visual beacon within the dark environment.
- **Borders (#1E293B):** Used for structural definition. These are subtle and designed to be felt rather than seen, maintaining the minimalist ethos.
- **Typography:** Headlines are set in pure White (#FFFFFF) to command attention, while body copy uses Light Grey (#94A3B8) to create a soft contrast that improves reading endurance.

## Typography
The typography is powered by **Inter**, chosen for its systematic neutrality and exceptional legibility at all scales. 

- **Headings:** Use bold weights (700) with slightly tightened letter-spacing to project a confident, architectural presence.
- **Body:** Prioritize readability with a generous 1.6 line-height. The Light Grey color ensures the text doesn't vibrate against the dark background.
- **Labels:** Small labels and metadata should use a semi-bold weight and uppercase transform to create clear distinctions from body text without needing additional colors.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 8px incremental spacing. This creates a rhythmic, predictable environment that feels organized.

- **Whitespace:** Use generous padding within cards and between sections (minimum 32px-48px) to allow the "founder-focused" content to breathe.
- **Grid:** A 12-column grid is used for desktop layouts, transitioning to a 4-column grid for mobile. 
- **Alignment:** Consistent left-alignment is preferred to maintain a fast, scan-efficient reading path.

## Elevation & Depth
This design system avoids heavy shadows and traditional skeuomorphism. Instead, it utilizes **Tonal Layers** and **Subtle Outlines** to communicate hierarchy.

- **Surface Levels:** The primary background is the lowest level. Cards and modals use the same background color but are defined by a 1px solid border (#1E293B).
- **Depth:** To indicate a "raised" state (e.g., a hovered card), the border color should subtly brighten or a very low-opacity (10%) white overlay can be applied to the surface.
- **Focus:** No blurs or frosted glass effects are permitted; depth is purely structural and crisp.

## Shapes
The shape language is **Soft** but leaning toward sharp. It avoids the playfulness of large radii in favor of "Refined Corners."

- **Base Radius:** 4px (0.25rem) is the standard for buttons, input fields, and small UI elements.
- **Large Radius:** 8px (0.5rem) is the maximum radius, used only for large containers or cards.
- **Geometry:** Elements should feel rectangular and sturdy, projecting a professional and operational tone.

## Components
Consistent execution of components is vital to maintaining the premium feel of the design system.

- **Buttons:** 
  - *Primary:* Electric Teal background with black or very dark blue text for high-contrast visibility. 4px radius.
  - *Secondary:* Transparent background with a #1E293B border and white text.
- **Input Fields:** Dark background (same as primary or slightly darker), 1px border (#1E293B), and 16px horizontal padding. Active states use an Electric Teal border.
- **Cards:** No background color change from the main canvas; depth is created solely via the 1px #1E293B border. Internal padding should be a minimum of 24px.
- **Chips/Badges:** Small, 4px radius, using a subtle #1E293B background with white or teal text to categorize items without distracting from the main CTA.
- **Lists:** Clean rows separated by 1px horizontal lines (#1E293B). No alternating row colors; use hover states to highlight interaction.
- **Data Tables:** High-density, minimal cell padding, and strict vertical alignment to support the "operational" focus.