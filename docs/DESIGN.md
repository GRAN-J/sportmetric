---
name: SportMetric Academic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f74'
  primary: '#071629'
  on-primary: '#ffffff'
  primary-container: '#1d2b3e'
  on-primary-container: '#8492a9'
  inverse-primary: '#b9c7e0'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#9cefdf'
  on-secondary-container: '#0b6f63'
  tertiary: '#280f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#462000'
  on-tertiary-container: '#da7823'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3fd'
  primary-fixed-dim: '#b9c7e0'
  on-primary-fixed: '#0d1c2e'
  on-primary-fixed-variant: '#3a485c'
  secondary-fixed: '#9ff2e2'
  secondary-fixed-dim: '#83d5c6'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  teal-accent: '#2dd4bf'
  outline-subtle: '#c5c6cd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  gutter: 20px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
---

## Brand & Style

SportMetric Academic embodies a "Minimalist-Scholar" aesthetic. It balances the rigorous, data-driven nature of sports science with a modern, approachable educational experience. The brand personality is precise, authoritative, and clean, utilizing ample whitespace to reduce cognitive load during complex data analysis. 

The visual style leans into **Modern Corporate** with a "Soft Minimalist" twist—using subtle shadows, thin outlines, and a professional teal-based palette to establish trust and clarity. It is designed for elite athletes, sports scientists, and academic researchers who require high-density information presented with surgical precision.

## Colors

The palette is anchored by **Deep Navy (#1d2b3e)** for high-level hierarchy and **Teal Primario (#006b5f)** for professional stability. The **Teal Secundario (#2dd4bf)** acts as a vibrant action color, used for progress indicators and primary calls to action, providing a high-energy contrast to the academic base.

**Academic Orange (#fb923c)** serves as a strategic tertiary accent, reserved for theory-related content, warnings, or high-priority notifications. The background system relies on a very light cool grey (**#f8fafc**) to maintain a clean, "laboratory" feel, with container surfaces utilizing white to pop against the subtle background.

## Typography

**Manrope** is the sole typeface, chosen for its geometric clarity and excellent legibility in technical contexts. 

- **Display & Headlines:** Use heavier weights (Bold/ExtraBold) and tighter letter spacing for a modern, impactful look.
- **Body Text:** Uses a standard 16px base for optimal readability. 
- **Labels:** Utilize a SemiBold weight and increased letter-spacing (0.05em) when uppercase to signify technical nomenclature and categories.
- **Mobile Adjustments:** Headlines above 32px should scale down by 20% on mobile devices to ensure readability without excessive wrapping.

## Layout & Spacing

The system follows a **Fixed Grid** approach for desktop, centering content within a 1200px maximum width container. 

- **Grid:** A 12-column grid is used for the main content area. On desktop, the sidebar typically occupies 3 columns, and the main content 9 columns.
- **Margins:** 20px (gutter) horizontal padding on all screens. 
- **Rhythm:** Vertical spacing follows an exponential scale (16, 24, 40, 64) to create distinct grouping levels. 
- **Mobile:** The layout collapses to a single column. The sidebar transforms into a bottom navigation bar or a hidden drawer to prioritize the main data display.

## Elevation & Depth

Depth is achieved through a combination of **Tonal Layering** and **Ambient Shadows**.

1.  **Canvas:** The background is the lowest level (`#f8fafc`).
2.  **Cards:** Primary containers use white backgrounds with a custom "Card Shadow": `0px 4px 20px rgba(51, 65, 85, 0.05)`. This shadow is extremely diffused and tinted with the primary navy color to feel integrated.
3.  **Borders:** Most containers also feature a subtle `1px` solid border (`#c5c6cd`) to define edges clearly, even on high-brightness screens.
4.  **Interaction:** Active states for buttons use a `translateY(2px)` effect to simulate a physical "press" rather than a shadow change.

## Shapes

The shape language is **Rounded**, conveying a modern and user-friendly feel that softens the "coldness" of technical data.

- **Standard Elements:** Buttons and small input fields use a `0.5rem` (8px) radius.
- **Containers:** Content cards and larger sections use a `0.75rem` (12px) radius to create a soft, approachable frame.
- **Special Elements:** Primary action buttons use a significantly more rounded `1rem` (16px) or "Pill" style to stand out as the main interactive touchpoints.
- **Icons:** Enclosed in `rounded-lg` backgrounds when used for navigation or categorisation.

## Components

### Buttons
- **Primary:** Background Teal Secundario (#2dd4bf), white text, rounded-2xl. Shadow on hover.
- **Secondary:** Transparent background, 1.5px border of Primary Navy (#1d2b3e), navy text.
- **Inverted:** Primary Navy (#1d2b3e) background, white text.

### Input Fields
- **Search Bar:** White background, 1.5px border (#c5c6cd), icons placed inside the left padding. Focus state changes border color to Teal Secundario.

### Cards
- **Standard Card:** White background, 12px roundedness, 1px border, subtle ambient shadow.
- **Bento Card:** Specialized cards with a 4px top-border accent in the secondary or tertiary color to categorize content types (e.g., Science vs. Theory).

### Navigation
- **Sidebar:** Uses high-contrast active states (Teal Secundario container with dark teal text) and subtle hover backgrounds for inactive items.
- **Bottom Navigation:** Mobile-only, 80px height, centered active state with a circular background pill.

### Progress Indicators
- Linear bars with a 10% opacity track of the indicator color and a fully opaque fill, utilizing rounded-full caps.