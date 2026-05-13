# AsyncApex Design System (MUI + React)

## 1. Core Aesthetic
- **Style:** Modern dark-mode with glassmorphism accents and subtle depth.
- **Edges:** Pill-rounded for interactive elements (buttons, navbar, chips). Moderately rounded for containers (cards, panels, icon boxes).
- **Backgrounds:** Layered ambient glows + a subtle dot-grid CSS overlay. Avoid flat solid fills — use semi-transparent layers with `backdrop-filter: blur`.
- **Depth:** Use `border: 1px solid rgba(139,92,246,0.12)` borders and translucent backgrounds instead of heavy shadows. Hover states reveal glow effects.

## 2. Color Palette (Deep Space + Violet)

### Base
| Token | Value | Usage |
|---|---|---|
| Background default | `#06060F` | Page background |
| Background paper | `#0D0D1A` | Cards, panels, navbar |
| Text primary | `#F1F0FF` | Headings, body copy |
| Text secondary | `#94A3B8` | Subtitles, captions, labels |
| Divider | `rgba(139,92,246,0.12)` | Section separators, card borders |

### Brand Colors
| Token | Value | Usage |
|---|---|---|
| Primary main | `#8B5CF6` | CTA buttons, interactive accents |
| Primary light | `#A78BFA` | Hover states, icon highlights |
| Primary dark | `#6D28D9` | Button gradient end, shadows |
| Secondary main | `#06B6D4` | Accent highlights, secondary CTAs |
| Secondary light | `#67E8F9` | Inline text accents |

### Semantic
| Token | Value | Usage |
|---|---|---|
| Error | `#F87171` | High priority, destructive |
| Warning | `#FBBF24` | Medium priority |
| Success | `#34D399` | Done/complete states |

## 3. Typography
- **Font:** `Inter` (loaded from Google Fonts). Fallback: Roboto → Helvetica → Arial.
- **Headings:** `fontWeight: 700–900`, `letterSpacing: -0.03em to -0.04em`. Always tight.
- **Body:** `fontWeight: 400`, `lineHeight: 1.65–1.7`.
- **Labels / Tags:** `fontWeight: 600–700`, `letterSpacing: 0.06–0.08em`, `textTransform: uppercase`, `fontSize: 0.7–0.75rem`.
- **Buttons:** `textTransform: none`, `fontWeight: 600`.
- **Gradient text:** Use `background-clip: text` + `WebkitTextFillColor: transparent` for headline accents. Preferred gradient: `linear-gradient(135deg, #F1F0FF → #C4B5FD → #8B5CF6)`.

## 4. Border Radius Rules

| Element | Radius | Notes |
|---|---|---|
| Buttons (all) | `9999px` (pill) | Set globally in theme `MuiButton.styleOverrides` |
| Floating Navbar | `9999px` (pill) | Pill-shaped floating bar |
| Chips / Badges | Pill (MUI default) | No override needed |
| Cards / Feature panels | `16px` | `borderRadius: '16px'` |
| Kanban column panels | `16px` | `borderRadius: '16px'` |
| Icon boxes (small square) | `8px–12px` | Slight rounding, not pill |
| Progress bars | `2px` | Thin bars stay subtly rounded |

## 5. UI Components

### Buttons
- **Contained primary:** gradient `linear-gradient(135deg, #7C3AED, #6D28D9)`, `boxShadow: 0 4px 15px rgba(109,40,217,0.35)`. Hover lifts with brighter gradient.
- **Outlined primary:** `borderColor: rgba(139,92,246,0.5)`, `color: #C4B5FD`. Hover fills subtly with `rgba(139,92,246,0.08)`.
- Both variants use `transform: translateY(-1px)` on hover.
- Configured via the MUI `variants` array (not `styleOverrides` keys) for MUI v5 compatibility.

### Navbar
- Floating pill bar: `position: fixed`, `top: 16px`, `width: calc(100% - 48px)`, `maxWidth: 1100px`, centered with `left: 50%; transform: translateX(-50%)`.
- Background: `rgba(13,13,26,0.75)` + `backdrop-filter: blur(20px)`.
- Border: `1px solid rgba(139,92,246,0.18)`.
- Logo: small gradient square icon (`#7C3AED → #06B6D4`) + gradient text.
- Nav links: subtle text buttons, `color: text.secondary`, hover to `text.primary` + `rgba(139,92,246,0.08)` background.

### Cards / Feature Panels
- Background: `rgba(13,13,26,0.7)`, `backdrop-filter: blur(10px)`.
- Border: `1px solid rgba(139,92,246,0.1)`.
- Hover: border brightens to `rgba(139,92,246,0.35)`, `transform: translateY(-4px)`.
- Each card may have a unique gradient icon box (48×48px, `borderRadius: 12px`) + per-card ambient glow that fades in on hover.

### Kanban Columns
- Background: `rgba(13,13,26,0.8)`, `backdrop-filter: blur(10px)`.
- Border: `1px solid rgba(139,92,246,0.12)`, brightens to `${columnAccent}40` on hover.
- Column header: colored `CircleRounded` dot + count chip.
- Progress bar per column reflects completion state.
- Task cards: `rgba(255,255,255,0.03)` fill, `border: 1px solid rgba(255,255,255,0.07)`. Hover → violet border + `translateY(-2px)` lift.
- Priority chips use semantic colors (error/warning/success). Tag chips use neutral style.

### Chips / Badges (section labels)
- Section label style: `background: rgba(primary,0.1)`, `border: 1px solid rgba(primary,0.25)`, `color: primaryLight`, `fontWeight: 600`, `textTransform: uppercase`, `letterSpacing: 0.08em`.
- Violet variant: `rgba(139,92,246,*)` — used on dark sections.
- Cyan variant: `rgba(6,182,212,*)` — used on feature sections.

## 6. Background & Atmosphere
- **Page background:** `#06060F` set on `html`.
- **Ambient glow (CSS `body::before`):** Three layered radial gradients — violet top-left, cyan bottom-right, violet-mid center. Animates with `ambientShift` keyframe (slow scale + translate, 18s).
- **Grid overlay (CSS `body::after`):** `60px × 60px` grid of `rgba(139,92,246,0.04)` lines. Static, pointer-events none.
- **Hero orb:** Absolute-positioned `700×700px` radial circle behind hero text, animates with subtle float (`orbFloat` keyframe).

## 7. Section Structure Pattern
Each page section follows this pattern:
1. **Section label chip** (uppercase, colored, e.g. "Features")
2. **H3 heading** with gradient-accented partial text
3. **Subtitle paragraph** (`text.secondary`, max-width ~520px, centered)
4. **Content grid** (3-col desktop, 1-col mobile via CSS grid or MUI)

## 8. Responsiveness
- Use MUI `Box` with `display: grid` and `gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }`.
- Use `Stack` for button groups and linear layouts.
- Navbar collapses nav links on `xs`/`sm` (hidden via `display: { xs: 'none', md: 'flex' }`).
- Containers use `maxWidth="lg"` with `Container` for consistent gutters.

## 9. Animation Conventions
- **Hover lifts:** `transform: translateY(-4px)` for cards, `translateY(-2px)` for task cards, `translateY(-1px)` for buttons.
- **Transition speed:** `0.2s ease` for micro-interactions, `0.25s ease` for card hovers.
- **Glow reveals:** opacity `0 → 1` on hover using a sibling `Box` with `className="feature-glow"`.
- **Background animations:** slow (8–18s), `alternate`, `ease-in-out` — never distracting.