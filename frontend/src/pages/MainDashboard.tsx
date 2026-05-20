import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Stack, 
  Skeleton,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  AddRounded, 
  AssessmentRounded,
  PersonRounded,
  GroupRounded,
  CheckCircleOutlineRounded,
  EmailRounded,
  BadgeRounded,
  ArrowForwardRounded,
  WarningAmberRounded
} from '@mui/icons-material';
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

  // Employee-specific dashboard state
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myTeamUsers, setMyTeamUsers] = useState<User[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

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
        } else {
          setEmployeeLoading(true);
          try {
            const taskData = await api.tasks.getAllByUser(user?.userId || '');
            setMyTasks((taskData as Task[]) || []);

            if (user?.teamId) {
              const teamData = await api.teams.getOne(user.teamId);
              setMyTeam(teamData as Team);
              const teamUsersData = await api.teams.getTeamUsers(user.teamId);
              setMyTeamUsers((teamUsersData as User[]) || []);
            }
          } catch (err) {
            console.error('Failed to fetch employee dashboard details', err);
          } finally {
            setEmployeeLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    if (!loading && user) fetchData();
  }, [loading, user?.role, user?.teamId, user?.userId]);

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

  // Employee stats calculation
  const totalMyTasks = myTasks.length;
  const todoTasks = myTasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress').length;
  const inReviewTasks = myTasks.filter(t => t.status === 'in-review').length;
  const doneTasks = myTasks.filter(t => t.status === 'done').length;
  const completionPercentage = totalMyTasks > 0 ? Math.round((doneTasks / totalMyTasks) * 100) : 0;
  const activeTasks = myTasks.filter(t => t.status !== 'done');

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
                        cx: '40%',
                      },
                    ]}
                    height={300}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    slotProps={{
                      legend: {
                        direction: 'vertical' as const,
                        position: { vertical: 'middle' as const, horizontal: 'end' as const },
                      },
                    }}
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
        <Box sx={{ mt: 4 }}>
          {employeeLoading ? (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px', mb: 4 }} />
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px' }} />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '24px', mb: 4 }} />
                <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '24px' }} />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {/* Left Column: Personal Profile & Assigned Team Details */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={4}>
                  {/* Profile Card */}
                  <Card sx={{ bgcolor: 'rgba(18, 22, 32, 0.8)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'black', display: 'flex' }}>
                          <PersonRounded />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>My Profile</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, mb: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: '2rem', fontWeight: 800, mb: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
                          {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{user?.name}</Typography>
                        <Chip 
                          label="Team Member" 
                          size="small" 
                          sx={{ fontWeight: 800, bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', px: 1 }} 
                        />
                      </Box>

                      <Divider sx={{ my: 3, opacity: 0.1 }} />

                      <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <EmailRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>Email Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BadgeRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>User Identifier</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>{user?.userId}</Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Team Details Card */}
                  <Card sx={{ bgcolor: 'rgba(18, 22, 32, 0.8)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'secondary.main', color: 'black', display: 'flex' }}>
                          <GroupRounded />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>My Assigned Team</Typography>
                      </Box>

                      {user?.teamId && myTeam ? (
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'secondary.main' }}>
                            {myTeam.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                            {myTeam.description || 'No description provided for this team.'}
                          </Typography>

                          <Divider sx={{ my: 3, opacity: 0.1 }} />

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Team Members ({myTeamUsers.length})
                          </Typography>

                          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {myTeamUsers.map((member) => (
                              <ListItem key={member.userId} disablePadding sx={{ py: 0.5 }}>
                                <ListItemAvatar sx={{ minWidth: 44 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: member.role === 'manager' ? 'secondary.dark' : 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', fontWeight: 800 }}>
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{member.name}</Typography>}
                                  secondary={
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                      {member.role} {member.userId === user.userId && '(You)'}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <WarningAmberRounded sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>Not Assigned to a Team</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Please contact your administrator or manager to be assigned to a team so you can begin working on tasks.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              {/* Right Column: Personal Tasks & Metrics */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={4}>
                  {/* Task Metrics & Completion Rate */}
                  <Card sx={{ bgcolor: 'rgba(18, 22, 32, 0.8)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>My Tasks Progress</Typography>
                        <Chip label={`${doneTasks} / ${totalMyTasks} Completed`} color="success" size="small" sx={{ fontWeight: 800 }} />
                      </Box>

                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Sprint Completion Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{completionPercentage}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={completionPercentage} 
                          sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255, 255, 255, 0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 5 } }} 
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(18, 22, 32, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{totalMyTasks}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>TOTAL TASKS</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(18, 22, 32, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#f59e0b' }}>{todoTasks + inProgressTasks}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>ACTIVE</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(18, 22, 32, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#6366f1' }}>{inReviewTasks}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>IN REVIEW</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(18, 22, 32, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#10b981' }}>{doneTasks}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>COMPLETED</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Active Tasks List */}
                  <Card sx={{ bgcolor: 'rgba(18, 22, 32, 0.8)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>My Active Tasks</Typography>
                        <Button 
                          variant="text" 
                          endIcon={<ArrowForwardRounded />} 
                          onClick={() => navigate('/tasks')} 
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Go to Task Planner
                        </Button>
                      </Box>

                      {activeTasks.length > 0 ? (
                        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {activeTasks.map((task) => (
                            <Box 
                              key={task.taskId} 
                              sx={{ 
                                p: 3, 
                                borderRadius: '16px', 
                                bgcolor: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 3,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                                }
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                                  <Chip 
                                    label={task.status.replace('-', ' ').toUpperCase()} 
                                    size="small" 
                                    sx={{ 
                                      fontWeight: 800, 
                                      fontSize: '0.7rem', 
                                      bgcolor: task.status === 'in-review' ? '#6366f1' : (task.status === 'in-progress' ? '#f59e0b' : 'rgba(255,255,255,0.08)'),
                                      color: task.status === 'in-review' || task.status === 'in-progress' ? 'white' : 'text.primary'
                                    }} 
                                  />
                                  <Chip 
                                    label={task.priority.toUpperCase()} 
                                    size="small" 
                                    sx={{ 
                                      fontWeight: 800, 
                                      fontSize: '0.7rem', 
                                      bgcolor: 'transparent',
                                      border: '1px solid',
                                      borderColor: task.priority === 'high' ? 'error.main' : (task.priority === 'medium' ? 'warning.main' : 'success.main'),
                                      color: task.priority === 'high' ? 'error.main' : (task.priority === 'medium' ? 'warning.main' : 'success.main'),
                                    }} 
                                  />
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{task.title}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                                  {task.description || 'No description provided.'}
                                </Typography>
                              </Box>

                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsViewModalOpen(true);
                                }}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                              >
                                View Details
                              </Button>
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                          <CheckCircleOutlineRounded sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>All Caught Up!</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            You have no active tasks left in your queue for this sprint.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          )}
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
