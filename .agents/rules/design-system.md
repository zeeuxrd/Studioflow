---
trigger: always_on
---

# Design System – StudioFlow

## Overview
StudioFlow uses a custom design system based on **Material Design 3 (MD3)** principles. All UI elements must strictly adhere to the tokens defined in `tokens/variables.css`. 

**Do not hardcode hex values or raw HSL strings in your components.** Always use the CSS custom properties (`var(--...)`) generated from the design tokens.

### Prohibited Styles
- **No Gradients:** Do not implement any gradients in the design.
- **No Glassmorphism:** Generic AI gradients and glassmorphism effects are strictly prohibited. Stick to solid semantic colors and standard MD3 elevation/shadows.

## 1. Color System

The color system is fully semantic. Use the appropriate variable based on the element's role:

### Backgrounds & Surfaces
- `--color-background`: The main page background.
- `--color-on-background`: Text on the main background.
- `--color-surface`: Standard cards, sheets, and menus.
- `--color-on-surface`: Text on standard surfaces.
- `--color-surface-variant`: Differentiated surface areas (e.g., search bars, toolbars).
- `--color-on-surface-variant`: Text on variant surfaces.
- `--color-outline`: Borders and dividers.

### Brand & Accents
- `--color-primary`: Main brand color for prominent buttons, active states, and FABs.
- `--color-on-primary`: Text/icons placed on top of `--color-primary`.
- `--color-primary-container`: Low-emphasis brand backgrounds (e.g., selected navigation items).
- `--color-on-primary-container`: Text/icons on primary containers.
- `--color-secondary`: Secondary brand color for less prominent accents.
- `--color-tertiary`: Third accent color, used for balancing primary/secondary.

### Status
- `--color-error`: Destructive actions, error messages.
- `--color-on-error`: Text/icons on error backgrounds.

## 2. Typography

All typography is mapped from Figma tokens and adheres to the MD3 scale. Use the appropriate scale for the component type:

- **Display**: Largest text on the screen. Reserved for short, important text or numerals.
  - `--typography-display-large-font-size`, `--typography-display-medium-font-size`, `--typography-display-small-font-size`
- **Heading**: Large text for sections and important sub-areas.
  - `--typography-heading-large-font-size`, `--typography-heading-medium-font-size`, `--typography-heading-small-font-size`
- **Title**: Medium-emphasis text that is shorter than body text. Used for app bars or card titles.
  - `--typography-title-large-font-size`, `--typography-title-medium-font-size`, `--typography-title-small-font-size`
- **Body**: Long-form reading text and primary text in components.
  - `--typography-body-large-font-size`, `--typography-body-medium-font-size`, `--typography-body-small-font-size`

*(Note: Always apply the corresponding `--line-height`, `--font-weight`, and `--letter-spacing` alongside the font size for a given scale).*

## 3. Interaction States (MD3 Fallbacks)

Because explicit tokens for hover, focus, active, and disabled states are not defined in the token files, you **MUST** use Material Design 3 State Layers to generate these interactions dynamically. 

State layers are created by overlaying the `on-` color (the text color for that component) at a specific opacity over the base component color.

### State Opacities:
- **Hover**: `8%` opacity of the `on-` color.
- **Focus**: `12%` opacity of the `on-` color.
- **Pressed/Active**: `12%` opacity of the `on-` color.
- **Dragged**: `16%` opacity of the `on-` color.

*Implementation (via CSS `color-mix`):*
```css
/* Example: Hover state for a Primary Button */
.btn-primary:hover {
  background: color-mix(in srgb, var(--color-on-primary) 8%, var(--color-primary));
}
```

### Disabled State:
- **Disabled Container**: `12%` opacity of the `on-surface` color.
- **Disabled Text/Icon**: `38%` opacity of the `on-surface` color.

*Implementation:*
```css
.btn:disabled {
  background: color-mix(in srgb, var(--color-on-surface) 12%, transparent);
  color: color-mix(in srgb, var(--color-on-surface) 38%, transparent);
  cursor: not-allowed;
  pointer-events: none;
}
```
