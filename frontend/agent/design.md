# AsyncApex Design System — Option B: Charcoal & Indigo

## 1. Core Aesthetic

- **Style:** Flat, professional dark mode. No glassmorphism, no gradients, no blur.
- **Edges:** Standard 8px border-radius for all interactive elements and cards. 6px for small interactive items (nav items, icon boxes). 12px for dialogs.
- **Backgrounds:** Single flat `background.default` page colour. Raised surfaces use `background.paper`. Never use `backdrop-filter: blur()`.
- **Depth:** Borders via the `divider` token. Hover states reveal a subtle `box-shadow`. No glow effects.

## 2. Single Source of Truth

**All colour values live in `src/theme/theme.ts`** — the exported `tokens` object.
Components must import from `tokens` or use MUI's `theme.palette.*` via `sx` props.
**Never hardcode hex values in component files.**

### Token Reference

```ts
// Surfaces
tokens.bgDefault    = '#0A0A0A'   // background.default
tokens.bgPaper      = '#141414'   // background.paper
tokens.bgElevated   = '#1C1C1C'   // action.hover / raised items
tokens.bgSubtle     = '#111111'   // table headers, inset regions

// Brand — Indigo
tokens.primaryMain  = '#6366F1'
tokens.primaryLight = '#818CF8'
tokens.primaryDark  = '#4F46E5'

// Accent — Cyan
tokens.secondaryMain  = '#22D3EE'
tokens.secondaryLight = '#67E8F9'

// Text
tokens.textPrimary   = '#F9FAFB'
tokens.textSecondary = '#9CA3AF'
tokens.textDisabled  = '#4B5563'

// Borders
tokens.divider      = '#262626'

// Semantic
tokens.errorMain   = '#F87171'
tokens.warningMain = '#FBBF24'
tokens.successMain = '#34D399'

// Feature accent colours (FeatureGrid / KanbanPreview data arrays only)
tokens.accentIndigo  = '#6366F1'
tokens.accentCyan    = '#22D3EE'
tokens.accentEmerald = '#34D399'
tokens.accentAmber   = '#FBBF24'
tokens.accentPink    = '#EC4899'
tokens.accentViolet  = '#818CF8'
```

## 3. Typography

- **Font:** `Inter` (from Google Fonts). Fallback: Roboto → Helvetica → Arial.
- **Headings:** `fontWeight: 700–900`, tight `letterSpacing`. Colour: `text.primary` (never gradient clip-text).
- **Body:** `fontWeight: 400`, `lineHeight: 1.65`.
- **Labels/Tags:** `fontWeight: 600–700`, `letterSpacing: 0.05–0.08em`, `textTransform: uppercase`, `fontSize: 0.7–0.75rem`.
- **Buttons:** `textTransform: none`, `fontWeight: 600`.
- **Accent spans:** Use `color: 'primary.light'` or `color: 'secondary.main'` for highlighted words in headings. No gradient clip-text.

## 4. Border Radius Rules

| Element | Radius | Notes |
|---|---|---|
| Buttons (all) | `8px` | Set globally in theme `MuiButton.styleOverrides` |
| Cards | `8px` | MUI theme `MuiCard` override |
| Dialogs | `12px` | MUI theme `MuiDialog` override |
| Nav items | `6px` | Inline in CollapsibleSidebar |
| Icon boxes | `6–8px` | Slightly less than cards |
| Progress bars | `4px` | MUI theme `MuiLinearProgress` override |

## 5. UI Components

### Buttons
- **Contained primary:** Flat `primary.main` fill. Hover → `primary.dark`. No gradient, no box-shadow.
- **Outlined primary:** `borderColor: primary.main`, hover fills with `primary.main` at 8% opacity.
- Configured entirely via `theme.ts` `MuiButton.styleOverrides`.

### Navbar (Landing)
- Standard full-width `AppBar`, `position="fixed"`. All styling from `MuiAppBar` theme override.
- Solid `background.paper` fill, `1px solid divider` bottom border.
- Logo: flat 30×30px `primary.main` square (no gradient) + plain text `text.primary`.
- Nav links: `text.secondary` colour, hover → `text.primary` + `action.hover` background.

### Sidebar (App)
- Width: 240px expanded / 64px collapsed. Fixed left, `background.paper`, `1px solid divider` right border.
- Active nav items: `bgcolor: 'primary.dark'`, `color: 'primary.contrastText'`.
- Hover on inactive items: `bgcolor: 'action.hover'`.
- Logo icon: same flat `primary.main` square as Navbar.

### Cards / Feature Panels
- `bgcolor: 'background.paper'`, `border: '1px solid divider'`, `borderRadius: 8px`.
- Hover: `borderColor: 'primary.main'` + `box-shadow: '0 4px 20px rgba(0,0,0,0.3)'`. No translateY lift.
- No `backdrop-filter`.

### Kanban Columns
- `bgcolor: 'background.paper'`, `border: '1px solid divider'`, `borderRadius: 8px`.
- Column header: accent `CircleRounded` dot + count chip in `action.hover` bg.
- Progress bar: override bar colour with column accent from `tokens`.
- Task cards: MUI `Card` via theme override (same borders/bg). Hover → `box-shadow` only.

### Priority / Status Chips
- Colour from `tokens.errorMain / warningMain / successMain` with 10% opacity bg and 20% opacity border.
- Pattern: `color: accentColor`, `bgcolor: \`${accentColor}1A\``, `border: \`1px solid ${accentColor}33\``.
- Tag chips: `bgcolor: 'action.hover'`, `border: '1px solid divider'`, `color: 'text.secondary'`.

### Dialogs
- Styled entirely by `MuiDialog` / `MuiDialogTitle` / `MuiDialogActions` theme overrides.
- `background.paper` fill, `divider` border, no glassmorphism.
- No inline `sx` styling on `Dialog` element — only on `DialogContent` for spacing.

### Tables
- `TableHead` cells: `background.subtle`, `text.secondary`, uppercase labels — via `MuiTableHead` override.
- Row hover: `action.hover` — via `MuiTableRow` override.
- Cell border: `divider` — via `MuiTableCell` override.

## 6. Background & Page Layout

- **Page background:** `#0A0A0A` set on `html` element in `index.css`.
- **No animations** on background. No `body::before` gradients. No `body::after` grid overlay.
- Dashboard pages: `bgcolor: 'background.default'` on the root Box.
- Auth pages (Login / SignUp): Left panel = `background.paper`, right panel = `background.default`.

## 7. Section Structure Pattern

Each landing page section follows:
1. **Section label chip** — `bgcolor: 'action.hover'`, `border: '1px solid divider'`, coloured text accent.
2. **H3 heading** with one key word in `color: 'primary.light'`.
3. **Subtitle paragraph** (`text.secondary`, max-width ~520px, centred).
4. **Content grid** (3-col desktop, 1-col mobile via CSS grid or MUI).

## 8. Responsiveness

- Same approach as before — MUI `Box` with `display: grid` and responsive `gridTemplateColumns`.
- Sidebar widths: 240px / 64px (updated from 260/80).
- Content margin matches sidebar: `ml: collapsed ? '64px' : '240px'`.

## 9. Animation Conventions

- **No background animations.** Removed `ambientShift`, `orbFloat`, all `body::before/after` CSS animations.
- **Hover transitions:** `transition: 'border-color 0.2s ease, box-shadow 0.2s ease'` on cards.
- **Nav transitions:** `transition: 'background-color 0.15s ease, color 0.15s ease'`.
- **Sidebar width:** `transition: 'width 0.25s ease'`.
- No `transform: translateY()` lifts on hover.