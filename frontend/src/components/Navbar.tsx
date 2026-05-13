import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { BoltRounded } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '1100px',
        zIndex: 1100,
        borderRadius: '9999px',
        backgroundColor: 'rgba(13, 13, 26, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.18)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(139,92,246,0.1)',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 56, md: 60 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(124, 58, 237, 0.5)',
              }}
            >
              <BoltRounded sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                fontSize: '1.15rem',
                background: 'linear-gradient(90deg, #F1F0FF 0%, #C4B5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AsyncApex
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {['Features', 'Documentation', 'Pricing'].map((label) => (
              <Button
                key={label}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 2,
                  '&:hover': { color: 'text.primary', bgcolor: 'rgba(139,92,246,0.08)' },
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* CTA */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 600, px: 2.5, py: 1, fontSize: '0.875rem' }}
            >
              Log in
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate('/role-selection')}
              sx={{ fontWeight: 700, px: 2.5, py: 1, fontSize: '0.875rem' }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
