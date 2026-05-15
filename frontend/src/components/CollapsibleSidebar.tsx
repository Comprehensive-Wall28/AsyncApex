import React from 'react';
import { Box, Typography, IconButton, Tooltip, Avatar } from '@mui/material';
import {
  BoltRounded,
  LogoutRounded,
  MenuOpenRounded,
  MenuRounded,
  DashboardRounded,
  SettingsRounded,
  ViewColumnRounded,
  FolderOpenRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

interface SidebarProps {
  userName?: string;
  collapsed: boolean;
  onToggle: () => void;
}

export const CollapsibleSidebar: React.FC<SidebarProps> = ({ userName, collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
    { label: 'Tasks', icon: <ViewColumnRounded />, path: '/tasks' },
    { label: 'Projects', icon: <FolderOpenRounded />, path: '/projects' },
  ];

  if (user?.role === 'manager') {
    navItems.push({ label: 'Management', icon: <SettingsRounded />, path: '/management' });
  }

  return (
    <Box
      sx={{
        width: collapsed ? 64 : 240,
        height: '100vh',
        bgcolor: 'background.default',
        transition: 'width 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => navigate('/dashboard')}
        >
          <Box
            sx={{
              minWidth: 30,
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BoltRounded sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          {!collapsed && (
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', whiteSpace: 'nowrap' }}>
              AsyncApex
            </Typography>
          )}
        </Box>
        {!collapsed && (
          <IconButton onClick={onToggle} size="small" sx={{ color: 'text.secondary' }}>
            <MenuOpenRounded fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <IconButton onClick={onToggle} size="small" sx={{ color: 'text.secondary' }}>
            <MenuRounded fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, py: 2, px: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.label}>
              <Box
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: collapsed ? 0 : 1.5,
                  py: 1,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  bgcolor: isActive ? 'rgba(96, 165, 250, 0.12)' : 'transparent',
                  color: isActive ? 'secondary.main' : 'text.secondary',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(96, 165, 250, 0.16)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? 'secondary.main' : 'text.primary',
                  },
                }}
              >
                {item.icon}
                {!collapsed && (
                  <Typography sx={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
            {userName ? userName.charAt(0).toUpperCase() : '?'}
          </Avatar>
          {!collapsed && (
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName ? userName.split(' ')[0] : 'User'}
            </Typography>
          )}
        </Box>
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
          >
            <LogoutRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
