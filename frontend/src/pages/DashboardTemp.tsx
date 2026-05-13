import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BoltRounded, LogoutRounded, DashboardRounded } from '@mui/icons-material';

export const DashboardTemp: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now, just redirect to login
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#06060F', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(139,92,246,0.12)',
          background: 'rgba(13,13,26,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltRounded sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary' }}>
            AsyncApex
          </Typography>
        </Box>

        <Button
          startIcon={<LogoutRounded />}
          onClick={handleLogout}
          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
        >
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 15, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Box
          sx={{
            p: 6,
            background: 'rgba(13,13,26,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'rgba(139,92,246,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <DashboardRounded sx={{ color: '#A78BFA', fontSize: 40 }} />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, background: 'linear-gradient(135deg, #F1F0FF 0%, #C4B5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome to your Dashboard
          </Typography>
          
          <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', mb: 6, maxWidth: 500, mx: 'auto' }}>
            Your enterprise control center is currently under construction. Check back soon for the full Kanban experience.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{ px: 4 }}
            >
              Back to Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Documentation
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
