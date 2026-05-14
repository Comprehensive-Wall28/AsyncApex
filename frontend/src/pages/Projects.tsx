import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { AddRounded, AssessmentRounded, CheckCircleRounded, TrendingUpRounded } from '@mui/icons-material';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { ProjectBox } from '../components/ProjectBox';
import { useNavigate } from 'react-router-dom';

export const Projects: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isManager = user?.role === 'manager';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';
  const navigate = useNavigate();

  if (loading) return null; // Or a spinner

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CollapsibleSidebar userName={user?.name} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 0.25s ease',
          width: `calc(100% - ${sidebarCollapsed ? 64 : 240}px)`,
          pb: 10,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 8 }}>
          {/* Command Header */}
          <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1, color: 'text.primary' }}>
                Welcome back, {firstName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                {isManager ? "Here's the overview for the current projects." : "Here are your assigned projects."}
              </Typography>
            </Box>

            {isManager && (
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<AssessmentRounded />} onClick={() => { navigate('/projects/new') }}>
                  New Project
                </Button>
                <Button variant="contained" startIcon={<AddRounded />}>
                  New Task
                </Button>
              </Stack>
            )}
          </Box>

          {/* Quick Stats */}
          {isManager && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
              <StatCard title="Active Tasks" value="124" icon={<AssessmentRounded />} trend="+12% from last week" />
              <StatCard title="Team Progress" value="68%" icon={<TrendingUpRounded />} trend="On track" trendColor="secondary.main" />
              <StatCard title="Approaching Deadlines" value="12" icon={<CheckCircleRounded />} trend="-3 this sprint" trendColor="error.main" />
            </Box>
          )}

          {/* Nexus Kanban Board */}
          <Box sx={{ mb: 6 }}>
            <ProjectBox teamId={user?.teamId} role={user?.role || 'employee'} />
          </Box>

          {/* Monitor Analytics (Manager Only) */}
          {isManager && (
            <Box sx={{ mt: 8 }}>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Monitor Analytics</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
                <Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  [Tasks Created vs. Closed Chart Simulation]
                </Box>
                <Box sx={{ height: 300, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  [Average Time-to-Close Chart Simulation]
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};
