import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Avatar } from '@mui/material';
import {
  BoltRounded,
  LogoutRounded,
  MenuOpenRounded,
  MenuRounded,
  DashboardRounded,
  AssignmentRounded,
  GroupRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

interface SidebarProps {
  userName?: string;
  collapsed: boolean;
  onToggle: () => void;
}

export const CollapsibleSidebar: React.FC<SidebarProps> = ({ userName, collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    { label: 'Dashboard', icon: <DashboardRounded />, path: '/dashboard' },
    { label: 'Projects', icon: <AssignmentRounded />, path: '/projects' },
    { label: 'Teams', icon: <GroupRounded />, path: '/teams' },
  ];

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 260,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'rgba(13, 13, 26, 0.75)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(139, 92, 246, 0.18)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
      }}
    >
      {/* Header / Logo */}
      <Box
        sx={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 3,
          borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', overflow: 'hidden' }} onClick={() => navigate('/dashboard')}>
          <Box
            sx={{
              minWidth: 32,
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
          {!collapsed && (
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary', whiteSpace: 'nowrap' }}>
              AsyncApex
            </Typography>
          )}
        </Box>
        {!collapsed && (
          <IconButton onClick={onToggle} sx={{ color: 'text.secondary' }}>
            <MenuOpenRounded />
          </IconButton>
        )}
      </Box>

      {/* Toggle when collapsed */}
      {collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <IconButton onClick={onToggle} sx={{ color: 'text.secondary' }}>
            <MenuRounded />
          </IconButton>
        </Box>
      )}

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, py: 3, px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.label}>
              <Box
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: collapsed ? 0 : 2,
                  py: 1.5,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: isActive ? 'primary.light' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.08)',
                    color: 'text.primary',
                  },
                }}
              >
                {item.icon}

                {!collapsed && (
                  <Typography
                    sx={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Footer / Profile */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(139, 92, 246, 0.12)',
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {userName ? (
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 600 }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.dark' }} />
          )}
          {!collapsed && (
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
              {userName ? userName.split(' ')[0] : 'User'}
            </Typography>
          )}
        </Box>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <IconButton onClick={handleLogout} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
            <LogoutRounded />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
