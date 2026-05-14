import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { BoltRounded } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // ── Floating pill geometry ─────────────────────────────────────────
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '1100px',
        borderRadius: '9999px',
        // ── Glassmorphism surface ──────────────────────────────────────────
        backgroundColor: 'rgba(13, 17, 26, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(148, 163, 184, 0.35)',
        boxShadow: '0 0 0 1px rgba(96,165,250,0.08), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        // ── Override theme AppBar defaults for this component ──────────────
        zIndex: 1100,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 52, md: 56 } }}>

          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BoltRounded sx={{ color: '#ffffff', fontSize: 18 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: '1.05rem',
                color: 'text.primary',
              }}
            >
              AsyncApex
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.25 }}>
            {['Features', 'Documentation', 'Pricing'].map((label) => (
              <Button
                key={label}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 1.75,
                  borderRadius: '9999px',
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.06)',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* CTA */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ px: 2.5, borderRadius: '9999px', fontSize: '0.85rem' }}
            >
              Log in
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate('/role-selection')}
              sx={{ px: 2.5, borderRadius: '9999px', fontSize: '0.85rem' }}
            >
              Get Started
            </Button>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};
