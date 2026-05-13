import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { AddRounded, AssessmentRounded, CheckCircleRounded, TrendingUpRounded } from '@mui/icons-material';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { StatCard } from '../components/StatCard';
import { TaskBoard } from '../components/TaskBoard';
import { useAuth } from '../hooks/useAuth';

export const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return null; // Or a spinner

  const isManager = user?.role === 'manager';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#06060F', position: 'relative', overflow: 'hidden' }}>
      <CollapsibleSidebar userName={user?.name} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarCollapsed ? '80px' : '260px',
          transition: 'margin-left 0.3s ease',
          width: `calc(100% - ${sidebarCollapsed ? 80 : 260}px)`,
          pb: 10,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 8, position: 'relative', zIndex: 1 }}>
          {/* Command Header */}
          <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 1, background: 'linear-gradient(135deg, #F1F0FF 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome back, {firstName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                {isManager ? "Here's the overview for your organization." : "Here are your assigned tasks for this sprint."}
              </Typography>
            </Box>

            {isManager && (
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<AssessmentRounded />}>
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
            <TaskBoard teamId={user?.teamId} role={user?.role || 'employee'} />
          </Box>

          {/* Monitor Analytics (Manager Only) */}
          {isManager && (
            <Box sx={{ mt: 8 }}>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Monitor Analytics</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
                <Box sx={{ height: 300, background: 'rgba(13,13,26,0.5)', borderRadius: 4, border: '1px solid rgba(139,92,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  [Tasks Created vs. Closed Chart Simulation]
                </Box>
                <Box sx={{ height: 300, background: 'rgba(13,13,26,0.5)', borderRadius: 4, border: '1px solid rgba(139,92,246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
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
