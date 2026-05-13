import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Avatar } from '@mui/material';
import { BoltRounded, LogoutRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface FloatingNavbarProps {
  userName?: string;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 1200,
        borderRadius: 9999,
        background: 'rgba(13, 13, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: 3 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
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

        {/* Nav Links (Center) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button sx={{ color: 'text.primary', fontWeight: 600 }}>Projects</Button>
          <Button sx={{ color: 'text.primary', fontWeight: 600 }}>Tasks</Button>
          <Button sx={{ color: 'text.secondary', fontWeight: 500 }}>Teams</Button>
        </Box>

        {/* Profile / Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, fontSize: '0.9rem' }}>
                {userName}
              </Typography>
            </Box>
          )}
          <IconButton onClick={handleLogout} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
            <LogoutRounded fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
