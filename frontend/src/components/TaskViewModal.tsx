import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  Avatar,
  Divider,
  Button,
  Grid,
  Skeleton,
  Drawer,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom
} from '@mui/material';
import {
  CloseRounded,
  EditRounded,
  CalendarTodayRounded,
  PeopleAltRounded,
  FlagRounded,
  InfoRounded,
  HistoryRounded,
  DeleteRounded,
  SendRounded,
  DeleteOutlineRounded,
  FullscreenRounded,
  CheckCircleRounded,
  ErrorOutlineRounded
} from '@mui/icons-material';
import api from '../api';
import type { Task, User, Team, Project, ActivityLog, Comment } from '../api/interface';
import { S3Image } from './S3Image';
import { tokens } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

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

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ open, onClose, onEdit, task: initialTask, users, teams, projects, loading: initialLoading, role, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [task, setTask] = useState<Task | undefined>(initialTask);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isImageFullOpen, setIsImageFullOpen] = useState(false);

  // Approve/Reject states
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (open && initialTask?.taskId) {
      setTask(initialTask);
      fetchTaskDetails(initialTask.taskId);
      fetchLogs(initialTask.taskId);
      fetchComments(initialTask.taskId);
    } else {
      setTask(undefined);
      setLogs([]);
      setComments([]);
    }
  }, [open, initialTask?.taskId]);

  const fetchTaskDetails = async (taskId: string) => {
    try {
      setLoading(true);
      const data = await api.tasks.getOne(taskId);
      setTask(data as any);
    } catch (err) {
      const fail = 'Failed to fetch task details '
      toast.error(fail + err)
      console.error(fail, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (taskId: string) => {
    try {
      const response = await api.tasks.getLogs(taskId) as any;
      const data = response.data ?? response;
      setLogs(Array.isArray(data) ? data : []);
      console.log("1")
    } catch (err) {
      const fail = 'Failed to fetch logs ';
      toast.error(fail + err);
      console.error(fail, err);
    }
  };

  const fetchComments = async (taskId: string) => {
    try {
      setCommentsLoading(true);
      const data = await api.comments.getByTask(taskId);
      // Sort comments by date ascending (oldest first)
      const sorted = (data as Comment[]).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setComments(sorted);
    } catch (err) {
      const fail = 'Failed to fetch comments '
      console.error('Failed to fetch comments', err);
      toast.error('Failed to fetch comments ' + err);
      toast.error(fail + err)
      console.error(fail, err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !task?.taskId) return;

    try {
      setIsPostingComment(true);
      const newComment = await api.comments.create({
        taskId: task.taskId,
        content: commentText.trim()
      });
      setComments(prev => [...prev, newComment as any]);
      setCommentText('');
    } catch (err) {
      const fail = 'Failed to post comment '
      toast.error(fail + err)
      console.error(fail, err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.comments.delete(commentId);
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch (err) {
      const fail = 'Failed to delete comment '
      toast.error(fail + err)
      console.error(fail, err);
    }
  };

  const handleDeleteTask = async () => {
    if (!task?.taskId) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setIsDeleting(true);
      await api.tasks.delete(task.taskId);
      onDelete?.();
      onClose();
    } catch (err) {
      const fail = 'Failed to delete task '
      toast.error(fail + err)
      console.error(fail, err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async () => {
    if (!task?.taskId) return;
    try {
      setIsApproving(true);
      await api.tasks.approve(task.taskId);
      setTask(prev => prev ? { ...prev, status: 'done' } : undefined);
      fetchLogs(task.taskId);
    } catch (err) {
      const fail = 'Failed to approve task '
      toast.error(fail + err)
      console.error(fail, err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!task?.taskId || !rejectionReason.trim()) return;
    try {
      setIsRejecting(true);
      await api.comments.create({
        taskId: task.taskId,
        content: `Rejected: ${rejectionReason}`
      });
      await api.tasks.reject(task.taskId);
      setTask(prev => prev ? { ...prev, status: 'in-progress' } : undefined);
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchLogs(task.taskId);
      fetchComments(task.taskId);
    } catch (err) {
      const fail = 'Failed to reject task '
      toast.error(fail + err)
      console.error(fail, err);
    } finally {
      setIsRejecting(false);
    }
  };

  if (!task && !loading && !initialLoading) return null;

  const assignee = task ? users.find(u => u.userId === task.assigneeId) : undefined;
  const team = task ? teams.find(t => t.teamId === task.teamId) : undefined;
  const project = task ? projects.find(p => p.projectId === task.projectId) : undefined;
  const priorityColor = task ? (priorityColorMap[task.priority] || tokens.textSecondary) : tokens.textSecondary;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', md: '60%', lg: '45%' },
              bgcolor: 'background.default',
              boxShadow: '-24px 0 48px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'black', display: 'flex' }}>
              <InfoRounded fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Task Details</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {task?.status === 'in-review' && role === 'manager' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleRounded />}
                  onClick={handleApprove}
                  disabled={isApproving}
                  sx={{ borderRadius: '12px', px: 2, fontWeight: 700 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ErrorOutlineRounded />}
                  onClick={() => setShowRejectDialog(true)}
                  sx={{ borderRadius: '12px', px: 2, fontWeight: 700 }}
                >
                  Reject
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.1 }} />
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<EditRounded />}
              onClick={onEdit}
              sx={{ borderRadius: '12px', px: 2 }}
            >
              Edit
            </Button>
            {role === 'manager' && (
              <IconButton
                color="error"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'rgba(211, 47, 47, 0.2)' }}
              >
                <DeleteRounded />
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{ borderRadius: '12px' }}>
              <CloseRounded />
            </IconButton>
          </Stack>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
          {loading || initialLoading ? (
            <Box sx={{ p: 4 }}>
              <Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 4 }} />
              <Skeleton variant="text" width="100%" height={100} />
            </Box>
          ) : task ? (
            <Grid container sx={{ m: 0 }}>
              {/* Main Content */}
              <Grid size={{ xs: 12 }} sx={{ p: 4 }}>
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {task.title}
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1, display: 'block' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                    {task.description || 'No description provided.'}
                  </Typography>
                </Box>

                {task.imageKey && (
                  <Box sx={{ mb: 6 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 2, display: 'block' }}>
                      Attachment
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'zoom-in',
                        '&:hover .expand-overlay': { opacity: 1 }
                      }}
                      onClick={() => setIsImageFullOpen(true)}
                    >
                      <S3Image imageKey={task.imageKey} sx={{ width: '100%', maxHeight: 400 }} />
                      <Box
                        className="expand-overlay"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        <FullscreenRounded sx={{ fontSize: 40, color: 'white' }} />
                      </Box>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ mb: 4, opacity: 0.5 }} />

                {/* Metadata Grid */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1, display: 'block' }}>Status</Typography>
                    <Chip label={task.status.replace('-', ' ').toUpperCase()} size="small" sx={{ fontWeight: 800, bgcolor: 'primary.main', color: 'black' }} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1, display: 'block' }}>Priority</Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <FlagRounded sx={{ color: priorityColor, fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 800, color: priorityColor, fontSize: '0.875rem' }}>{task.priority.toUpperCase()}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    {/* Dynamic Title: Shows 'Assignee' if true, otherwise 'Team' */}
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1, display: 'block' }}>
                      {assignee ? 'Assignee' : 'Team'}
                    </Typography>

                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>

                      {/* Dynamic Avatar Initials */}
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.875rem', fontWeight: 800 }}>
                        {assignee
                          ? assignee.name.substring(0, 2).toUpperCase()
                          : (team ? team.name.substring(0, 2).toUpperCase() : '?')}
                      </Avatar>

                      {/* Dynamic Display Name */}
                      <Typography sx={{ fontWeight: 700 }}>
                        {assignee
                          ? assignee.name
                          : (team ? team.name : 'Unassigned')}
                      </Typography>

                    </Stack>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 6, p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 0.5, display: 'block' }}>Team</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <PeopleAltRounded sx={{ fontSize: 16, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{team ? team.name : 'N/A'}</Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 0.5, display: 'block' }}>Project</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <CalendarTodayRounded sx={{ fontSize: 16, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{project ? project.name : 'N/A'}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* Comments Section */}
                <Box sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Comments</Typography>
                    <Chip label={comments.length} size="small" sx={{ fontWeight: 800, height: 20 }} />
                  </Box>

                  {/* Comment Input */}
                  <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                      {currentUser?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          variant="contained"
                          disabled={!commentText.trim() || isPostingComment}
                          onClick={handlePostComment}
                          startIcon={<SendRounded />}
                          sx={{ borderRadius: '12px', fontWeight: 700 }}
                        >
                          Post
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Comment Feed */}
                  <Stack spacing={3}>
                    {commentsLoading ? (
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <Box key={comment.commentId} sx={{ display: 'flex', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.1)', fontSize: '0.875rem' }}>
                            {comment.authorName.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.authorName}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                  {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                              {(currentUser?.userId === comment.authorId || role === 'manager') && (
                                <Tooltip title="Delete comment">
                                  <IconButton size="small" onClick={() => handleDeleteComment(comment.commentId)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}>
                                    <DeleteOutlineRounded fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                              {comment.content}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                        No comments yet. Be the first to start the conversation!
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Activity Log Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <HistoryRounded sx={{ color: tokens.textSecondary }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Activity Log</Typography>
                  </Box>

                  {logs.length > 0 ? (
                    <Stack spacing={3} sx={{ position: 'relative', pl: 3 }}>
                      <Box sx={{ position: 'absolute', left: 7, top: 10, bottom: 10, width: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                      {logs.map((log, idx) => (
                        <Box key={idx} sx={{ position: 'relative' }}>
                          <Box sx={{ position: 'absolute', left: -27, top: 6, width: 10, height: 10, borderRadius: '50%', bgcolor: idx === 0 ? tokens.secondaryMain : 'rgba(255,255,255,0.2)', border: '2px solid background.default', zIndex: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                            {(log as any).eventType === 'TASK_ASSIGNED' || (log as any).assigneeEmail || (log as any).assigneeName ? (
                              <>
                                Task assigned to{' '}
                                <Box component="span" sx={{ color: tokens.secondaryMain, fontWeight: 700 }}>
                                  {(log as any).assigneeName || (log as any).assigneeEmail || 'Someone'}
                                </Box>
                              </>
                            ) : log.oldStatus && log.newStatus ? (
                              <>
                                {log.userName || 'Someone'} moved task from{' '}
                                <Box component="span" sx={{ color: tokens.textSecondary, textTransform: 'uppercase', fontSize: '0.75rem' }}>{log.oldStatus}</Box>
                                {' to '}
                                <Box component="span" sx={{ color: tokens.secondaryMain, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{log.newStatus}</Box>
                              </>
                            ) : (
                              <>{log.userName || 'Someone'} updated the task</>
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                            {new Date(log.timestamp).toLocaleString()}
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
            </Grid>
          ) : null}
        </Box>
      </Drawer>

      {/* Full Image Dialog */}
      <Dialog
        open={isImageFullOpen}
        onClose={() => setIsImageFullOpen(false)}
        maxWidth="xl"
        slots={{ transition: Zoom }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              backgroundImage: 'none',
              overflow: 'hidden'
            }
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setIsImageFullOpen(false)}
            sx={{ position: 'absolute', right: 16, top: 16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
          >
            <CloseRounded />
          </IconButton>
          {task?.imageKey && (
            <S3Image imageKey={task.imageKey} sx={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
          )}
        </Box>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              minWidth: 400
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Reject Task
          <IconButton onClick={() => setShowRejectDialog(false)} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a reason for rejecting this task. This will be posted as a comment.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Feedback for the assignee..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowRejectDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || isRejecting}
            onClick={handleReject}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
