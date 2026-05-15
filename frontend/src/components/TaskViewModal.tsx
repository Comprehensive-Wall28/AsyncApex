import React from 'react';
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
import { CloseRounded, EditRounded, CalendarTodayRounded, PeopleAltRounded, FlagRounded, InfoRounded } from '@mui/icons-material';
import type { Task, User, Team, Project } from '../api/interface';
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
}

const priorityColorMap: Record<string, string> = {
  high: tokens.errorMain,
  medium: tokens.warningMain,
  low: tokens.successMain,
};

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ open, onClose, onEdit, task, users, teams, projects, loading }) => {
  if (!task && !loading) return null;

  const assignee = task ? users.find(u => u.userId === task.assigneeId) : undefined;
  const team = task ? teams.find(t => t.teamId === task.teamId) : undefined;
  const project = task ? projects.find(p => p.projectId === task.projectId) : undefined;
  const priorityColor = task ? (priorityColorMap[task.priority] || tokens.textSecondary) : tokens.textSecondary;

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
