import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// ─── Ocean ───────────────────────────────────────────────────────────────────
// Single source of truth. Components use theme.palette.* or import `tokens`.
// Never hardcode hex values in component files.

export const tokens = {
  // ── Surfaces ────────────────────────────────────────────────────────────
  bgDefault:  '#0a0c12',    // page background
  bgPaper:    '#0d111a',    // cards, panels, sidebar
  bgElevated: '#121620',    // slightly raised (hover rows, kanban cards)
  bgSubtle:   '#0b0e15',    // table headers, inset regions

  // ── Primary — White ──────────────────────────────────────────────────────
  primaryMain:         '#ffffff',
  primaryLight:        '#f8fafc',   // near-white hover
  primaryDark:         '#cbd5e1',   // slate-300, pressed / muted
  primaryContrastText: '#000000',

  // ── Secondary — Sky Blue accent ──────────────────────────────────────────────────
  // Vibrant accent that works as text highlight AND interactive surface.
  secondaryMain:         '#60a5fa',   // blue-400 — visible accent on dark bg
  secondaryLight:        '#93c5fd',   // blue-300 — softer highlights
  secondaryDark:         '#3b82f6',   // blue-500 — deeper/pressed state
  secondaryContrastText: '#0a0c12',   // dark text on blue surfaces

  // ── Text ────────────────────────────────────────────────────────────────
  textPrimary:   '#f1f5f9',   // slate-100
  textSecondary: '#94a3b8',   // slate-400
  textDisabled:  '#475569',   // slate-600

  // ── Borders / Dividers ──────────────────────────────────────────────────
  divider:      'rgba(148, 163, 184, 0.2)',   // slate-400 at 20%
  borderSubtle: 'rgba(148, 163, 184, 0.08)',  // slate-400 at 8%

  // ── Semantic ────────────────────────────────────────────────────────────
  errorMain:   '#F87171',
  warningMain: '#FBBF24',
  successMain: '#34D399',

  // ── Feature accent colours ───────────────────────────────────────────────
  // Used only in FeatureGrid / KanbanPreview data arrays — not inline styles.
  accentIndigo:  '#818CF8',
  accentCyan:    '#22D3EE',
  accentEmerald: '#34D399',
  accentAmber:   '#FBBF24',
  accentPink:    '#F472B6',
  accentViolet:  '#A78BFA',
};

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.04em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // ── Buttons ────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'background-color 0.15s ease, opacity 0.15s ease',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: tokens.primaryMain,
            color: tokens.primaryContrastText,
            '&:hover': { backgroundColor: tokens.primaryDark },
            '&:disabled': { backgroundColor: tokens.bgElevated, color: tokens.textDisabled },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: 'rgba(255,255,255,0.25)',
            color: tokens.textPrimary,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.45)',
            },
          },
        },
      ],
    },

    // ── Paper ─────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.bgPaper,
          borderRadius: 8,
        },
      },
    },

    // ── Card ──────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.bgPaper,
          border: `1px solid ${tokens.divider}`,
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },

    // ── AppBar (used by FloatingNavbar in app, Navbar on landing) ──────────
    // Note: The floating landing Navbar overrides these via sx props.
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.bgPaper,
          borderBottom: `1px solid ${tokens.divider}`,
          boxShadow: 'none',
        },
      },
    },

    // ── Drawer / Sidebar ──────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: tokens.bgPaper,
          borderRight: `1px solid ${tokens.divider}`,
        },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────────
    MuiTableContainer: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: tokens.bgSubtle,
            color: tokens.textSecondary,
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderBottom: `1px solid ${tokens.divider}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: tokens.bgElevated },
          '&:last-child td, &:last-child th': { border: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${tokens.divider}` },
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${tokens.divider}` },
        indicator: { backgroundColor: tokens.primaryMain },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: tokens.textSecondary,
          '&.Mui-selected': { color: tokens.textPrimary },
        },
      },
    },

    // ── TextField ─────────────────────────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.primaryMain,
          },
        },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.bgPaper,
          backgroundImage: 'none',
          border: `1px solid ${tokens.divider}`,
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.divider}`,
          fontWeight: 700,
          fontSize: '1.05rem',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${tokens.divider}`,
          padding: '16px 24px',
        },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: tokens.bgElevated, borderRadius: 4 },
        bar: { backgroundColor: tokens.primaryMain, borderRadius: 4 },
      },
    },
  },
};

export const theme = createTheme({
  ...baseOptions,
  palette: {
    mode: 'dark',
    primary: {
      main:         tokens.primaryMain,
      light:        tokens.primaryLight,
      dark:         tokens.primaryDark,
      contrastText: tokens.primaryContrastText,
    },
    secondary: {
      main:         tokens.secondaryMain,
      light:        tokens.secondaryLight,
      dark:         tokens.secondaryDark,
      contrastText: tokens.secondaryContrastText,
    },
    background: {
      default: tokens.bgDefault,
      paper:   tokens.bgPaper,
    },
    text: {
      primary:  tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled:  tokens.textDisabled,
    },
    divider: tokens.divider,
    error:   { main: tokens.errorMain },
    warning: { main: tokens.warningMain },
    success: { main: tokens.successMain },
  },
});
