import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { AddRounded, AssessmentRounded } from '@mui/icons-material';

import { TaskModal } from '../components/TaskModal';
import { TaskViewModal } from '../components/TaskViewModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Task, User, Team, Project } from '../api/interface';
import { chartBoxSx } from '../styles/style';

export const MainDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const [u, t, p] = await Promise.all([
          api.users.getAll(),
          api.teams.getAll(),
          api.projects.getAll()
        ]);
        setUsers(u as any);
        setTeams(t as any);
        setProjects(p as any);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

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

      {/* Monitoring Section (Optional: add a summary or just keep it simple) */}

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

      <TaskViewModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsTaskModalOpen(true);
        }}
        task={selectedTask}
        users={users}
        teams={teams}
        projects={projects}
        loading={isDataLoading}
        role={user?.role}
        onDelete={() => navigate(0)} // Refresh current page
      />

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={() => navigate('/tasks')}
        task={selectedTask}
      />
    </Container>
  );
};
