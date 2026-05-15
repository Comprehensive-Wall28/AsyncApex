import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  Avatar,
  Divider,
  Button,
  Grid,
  Skeleton
} from '@mui/material';
import { CloseRounded, EditRounded, CalendarTodayRounded, PeopleAltRounded, FlagRounded, InfoRounded, HistoryRounded, DeleteRounded } from '@mui/icons-material';
import api from '../api';
import type { Task, User, Team, Project, ActivityLog } from '../api/interface';
import { S3Image } from './S3Image';
import { tokens } from '../theme/theme';

interface TaskViewModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  task?: Task;
  users: User[];
  teams: Team[];
  projects: Project[];
  loading?: boolean;
  role?: 'manager' | 'employee';
  onDelete?: () => void;
}

const priorityColorMap: Record<string, string> = {
  high: tokens.errorMain,
  medium: tokens.warningMain,
  low: tokens.successMain,
};

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ open, onClose, onEdit, task, users, teams, projects, loading, role, onDelete }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && task?.taskId) {
      const fetchLogs = async () => {
        try {
          setLogsLoading(true);
          const data = await api.tasks.getLogs(task.taskId);
          setLogs(data as any);
        } catch (err) {
          console.error('Failed to fetch logs', err);
        } finally {
          setLogsLoading(false);
        }
      };
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [open, task?.taskId]);

  if (!task && !loading) return null;

  const assignee = task ? users.find(u => u.userId === task.assigneeId) : undefined;
  const team = task ? teams.find(t => t.teamId === task.teamId) : undefined;
  const project = task ? projects.find(p => p.projectId === task.projectId) : undefined;
  const priorityColor = task ? (priorityColorMap[task.priority] || tokens.textSecondary) : tokens.textSecondary;

  const handleDelete = async () => {
    if (!task?.taskId) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setIsDeleting(true);
      await api.tasks.delete(task.taskId);
      onDelete?.();
      onClose();
    } catch (err) {
      console.error('Failed to delete task', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
          borderRadius: 3,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle component="div" sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InfoRounded color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Task Details</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditRounded />}
            onClick={onEdit}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Edit Task
          </Button>
          {role === 'manager' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteRounded />}
              onClick={handleDelete}
              disabled={isDeleting}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                borderColor: 'rgba(211, 47, 47, 0.5)',
                '&:hover': {
                  borderColor: 'error.main',
                  bgcolor: 'rgba(211, 47, 47, 0.04)'
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider sx={{ opacity: 0.1 }} />

      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden', flex: 1 }}>
        {loading ? (
          <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>
            <Grid size={{ xs: 12, md: 8 }} sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
              <Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
              <Skeleton variant="text" width="20%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 2 }} />
              <Skeleton variant="text" width="20%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ p: 4, bgcolor: 'rgba(255, 255, 255, 0.02)', borderLeft: '1px solid', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Stack spacing={4}>
                {[1, 2, 3, 4].map(i => (
                  <Box key={i}>
                    <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        ) : task ? (
          <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>
            {/* Main Content (Scrollable) */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {task.title}
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block' }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                  {task.description || 'No description provided.'}
                </Typography>
              </Box>

              {task.imageKey && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                    Attachment
                  </Typography>
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <S3Image imageKey={task.imageKey} sx={{ width: '100%', maxHeight: 500 }} />
                  </Box>
                </Box>
              )}

              {/* Activity Log Section */}
              <Box sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <HistoryRounded sx={{ color: tokens.textSecondary }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Activity Log</Typography>
                </Box>
                
                {logsLoading ? (
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </Stack>
                ) : logs.length > 0 ? (
                  <Stack spacing={3} sx={{ position: 'relative', pl: 3 }}>
                    {/* Vertical line for timeline */}
                    <Box sx={{ 
                      position: 'absolute', 
                      left: 7, 
                      top: 10, 
                      bottom: 10, 
                      width: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderRadius: 1
                    }} />
                    
                    {logs.map((log, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        {/* Timeline dot */}
                        <Box sx={{ 
                          position: 'absolute', 
                          left: -27, 
                          top: 6, 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: idx === 0 ? tokens.secondaryMain : 'rgba(255,255,255,0.2)',
                          border: '2px solid background.default',
                          zIndex: 1
                        }} />
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {log.userName || 'Someone'} moved task from{' '}
                          <Box component="span" sx={{ color: tokens.textSecondary, textTransform: 'uppercase', fontSize: '0.75rem' }}>{log.oldStatus}</Box>
                          {' to '}
                          <Box component="span" sx={{ color: tokens.secondaryMain, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{log.newStatus}</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                          {new Date(log.timestamp).toLocaleString(undefined, { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    No activity recorded yet.
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Sidebar Metadata (Fixed) */}
            <Grid size={{ xs: 12, md: 4 }} sx={{
              p: 4,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderLeft: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Stack spacing={4}>

                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
                    Status
                  </Typography>
                  <Chip
                    label={task.status.replace('-', ' ').toUpperCase()}
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
                    Priority
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlagRounded sx={{ color: priorityColor }} />
                    <Typography sx={{ fontWeight: 700, color: priorityColor, textTransform: 'uppercase' }}>
                      {task.priority}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
                    Assignee
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.dark', fontWeight: 700 }}>
                      {assignee ? assignee.name.substring(0, 2).toUpperCase() : '?'}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{assignee ? assignee.name : 'Unassigned'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{assignee ? assignee.email : 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
                    Team & Project
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <PeopleAltRounded fontSize="small" sx={{ opacity: 0.6 }} />
                      <Typography variant="body2">{team ? team.name : 'No Team'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CalendarTodayRounded fontSize="small" sx={{ opacity: 0.6 }} />
                      <Typography variant="body2">{project ? project.name : 'No Project'}</Typography>
                    </Stack>
                  </Stack>
                </Box>

                {task.deadline && (
                  <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
                      Deadline
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: 'error.light' }}>
                      {new Date(task.deadline).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </Typography>
                  </Box>
                )}

              </Stack>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
