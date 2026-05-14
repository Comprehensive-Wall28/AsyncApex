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
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltRounded sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary' }}>
            AsyncApex
          </Typography>
        </Box>

        {/* Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button sx={{ color: 'text.primary', fontWeight: 600 }}>Projects</Button>
          <Button sx={{ color: 'text.primary', fontWeight: 600 }}>Tasks</Button>
          <Button sx={{ color: 'text.secondary', fontWeight: 500 }}>Teams</Button>
        </Box>

        {/* Profile / Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {userName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, fontSize: '0.9rem', color: 'text.primary' }}>
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
