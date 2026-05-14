import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Sidebar Section */}
      <Box sx={{ 
        height: '100vh',
        flexShrink: 0,
        zIndex: 1200,
      }}>
        <CollapsibleSidebar 
          userName={user?.name} 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </Box>

      {/* Main Content Area with "Pilled Border" */}
      <Box
        sx={{
          flexGrow: 1,
          m: 1.5,
          ml: 0,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 2, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
