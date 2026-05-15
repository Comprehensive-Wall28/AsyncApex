import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { AddRounded, AssessmentRounded, CheckCircleRounded, TrendingUpRounded } from '@mui/icons-material';
import { StatCard } from '../components/StatCard';
import { TaskBoard } from '../components/TaskBoard';
import { TaskModal } from '../components/TaskModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../api/interface';
import { chartBoxSx } from '../styles/style';

export const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  if (loading) return null;

  const isManager = user?.role === 'manager';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Command Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1, color: 'text.primary' }}>
            Welcome back, {firstName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            {isManager ? "Here's the overview for your organization." : "Here are your assigned tasks for this sprint."}
          </Typography>
        </Box>

        {isManager && (
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<AssessmentRounded />} onClick={() => { navigate('/projects/new') }}>
              New Project
            </Button>
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }}>
              New Task
            </Button>
          </Stack>
        )}
      </Box>

      {/* Nexus Kanban Board */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Sprint Pipeline
        </Typography>
        <TaskBoard
          teamId={user?.teamId}
          role={user?.role || 'employee'}
          refreshKey={boardRefreshKey}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
          }}
        />
      </Box>

      {isManager && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Monitor Analytics</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
            <Box sx={chartBoxSx}>
              [Tasks Created vs. Closed Chart Simulation]
            </Box>
            <Box sx={chartBoxSx}>
              [Average Time-to-Close Chart Simulation]
            </Box>
          </Box>
        </Box>
      )}

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={() => setBoardRefreshKey(prev => prev + 1)}
        task={selectedTask}
      />
    </Container>
  );
};
