import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack, Skeleton } from '@mui/material';
import { AddRounded, AssessmentRounded } from '@mui/icons-material';
import { PieChart, BarChart } from '@mui/x-charts';

import { TaskModal } from '../components/TaskModal';
import { TaskViewModal } from '../components/TaskViewModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Task, User, Team, Project, StatusStats } from '../api/interface';
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
  const [stats, setStats] = useState<StatusStats | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const isManager = user?.role === 'manager';
        const [u, t, p] = await Promise.all([
          isManager ? api.users.getAll() : (user?.teamId ? api.teams.getTeamUsers(user.teamId) : Promise.resolve([])),
          api.teams.getAll(),
          api.projects.getAll()
        ]);
        setUsers(u as any);
        setTeams(t as any);
        setProjects(p as any);

        if (isManager) {
          const s = await api.status.check();
          setStats(s);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    if (!loading) fetchData();
  }, [loading, user?.role, user?.teamId]);

  if (loading) return null;

  const isManager = user?.role === 'manager';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  // Pie chart data: Created vs. Closed
  const pieData = stats ? [
    { id: 0, value: stats.analytics.totalTasks - stats.analytics.closedTasks, label: 'Open', color: '#6366f1' },
    { id: 1, value: stats.analytics.closedTasks, label: 'Closed', color: '#10b981' },
  ] : [];

  // Bar chart data: Avg Time-to-Close
  const barData = stats?.analytics.teamMetrics.map(m => m.avgTimeToClose) || [];
  const xLabels = stats?.analytics.teamMetrics.map(m => m.teamName) || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Command Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1, color: 'text.primary', fontWeight: 800 }}>
            Welcome back, {firstName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            {isManager ? "Here's the performance overview for your organization." : "Here are your assigned tasks for this sprint."}
          </Typography>
        </Box>

        {isManager && (
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              startIcon={<AssessmentRounded />} 
              onClick={() => { navigate('/projects/new') }}
              sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)', color: 'text.primary' }}
            >
              New Project
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddRounded />} 
              onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }}
              sx={{ borderRadius: '12px', bgcolor: '#fff', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              New Task
            </Button>
          </Stack>
        )}
      </Box>

      {isManager && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Organization Analytics</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 4 }}>
            {/* Pie Chart: Tasks Created vs. Closed */}
            <Box sx={{ ...chartBoxSx, p: 3, display: 'block', height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Task Completion Rate</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                {isDataLoading ? (
                  <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
                ) : (
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 80,
                        outerRadius: 120,
                        paddingAngle: 5,
                        cornerRadius: 5,
                      },
                    ]}
                    height={300}
                  />
                )}
              </Box>
              <Stack direction="row" spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total: <strong>{stats?.analytics.totalTasks}</strong></Typography>
                <Typography variant="body2" sx={{ color: '#10b981' }}>Closed: <strong>{stats?.analytics.closedTasks}</strong></Typography>
              </Stack>
            </Box>

            {/* Bar Chart: Avg Time-to-Close */}
            <Box sx={{ ...chartBoxSx, p: 3, display: 'block', height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Average Time-to-Close (Hours)</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                {isDataLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={250} />
                ) : (
                  <BarChart
                    height={300}
                    series={[{ data: barData, label: 'Hours', id: 'pvId', color: '#6366f1' }]}
                    xAxis={[{ data: xLabels, scaleType: 'band' }]}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {!isManager && (
        <Box sx={{ mt: 4, p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            Personal task view coming soon. Use the Sidebar to navigate to your Task Planner.
          </Typography>
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
