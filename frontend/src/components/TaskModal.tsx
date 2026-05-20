import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
  Skeleton
} from '@mui/material';
import { CloseRounded, CloudUploadRounded, DeleteRounded, SwapHorizRounded } from '@mui/icons-material';
import api from '../api';
import type { Task, User, Team, Project } from '../api/interface';
import { S3Image } from './S3Image';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, onSave, task }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');

  // Image state
  // - existingImageKey: the S3 key already saved on the task (null = none or removed)
  // - newFile: a brand new file the user just picked (null = not picking a new one)
  // - newFilePreviewUrl: object URL for previewing newFile
  const [existingImageKey, setExistingImageKey] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreviewUrl, setNewFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAssignee = !!assigneeId;
  const hasTeam = !!teamId;
  const hasAtLeastOneAssignment = hasAssignee || hasTeam;
  const canSubmit = !!title && !!priority && !!projectId && hasAtLeastOneAssignment;

  useEffect(() => {
    if (open) {
      fetchDropdownData();
      if (task) {
        // Edit mode — pre-fill everything
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority || 'medium');
        setDeadline(task.deadline ? String(task.deadline).split('T')[0] : '');
        setAssigneeId(task.assigneeId || '');
        setTeamId(task.teamId || '');
        setProjectId(task.projectId || '');
        setExistingImageKey(task.imageKey || null);
        setNewFile(null);
        setNewFilePreviewUrl(null);
      } else {
        // Create mode — blank slate
        resetForm();
      }
    }
  }, [open, task]);

  // Clean up the object URL when component unmounts or newFile changes
  useEffect(() => {
    return () => {
      if (newFilePreviewUrl) URL.revokeObjectURL(newFilePreviewUrl);
    };
  }, [newFilePreviewUrl]);

  const fetchDropdownData = async () => {
    try {
      setDataLoading(true);
      const [usersRes, teamsRes, projectsRes] = await Promise.all([
        api.users.getAll(),
        api.teams.getAll(),
        api.projects.getAll(),
      ]);
      setUsers(usersRes as any);
      setTeams(teamsRes as any);
      setProjects(projectsRes as any);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setAssigneeId('');
    setTeamId('');
    setProjectId('');
    setExistingImageKey(null);
    setNewFile(null);
    setNewFilePreviewUrl(null);
  };

  // ─── File helpers ─────────────────────────────────────────────────────────

  const applyFile = (file: File) => {
    // Revoke any previous object URL to avoid memory leaks
    if (newFilePreviewUrl) URL.revokeObjectURL(newFilePreviewUrl);

    setNewFile(file);
    setNewFilePreviewUrl(URL.createObjectURL(file));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  // Called when user clicks "Replace" on the existing S3 image
  const handleReplaceExisting = () => {
    openFilePicker();
    // We don't clear existingImageKey yet — we only visually replace once a file is chosen
  };

  // Called when user explicitly removes the existing S3 image without replacing
  const handleDeleteExisting = () => {
    setExistingImageKey(null);
  };

  // Called when user removes the newly-selected file
  // If a task already had an image, restore showing it; otherwise just clear
  const handleRemoveNewFile = () => {
    if (newFilePreviewUrl) URL.revokeObjectURL(newFilePreviewUrl);
    setNewFile(null);
    setNewFilePreviewUrl(null);
    // Restore the original S3 image if the task had one
    setExistingImageKey(task?.imageKey || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const buildPayload = () => ({
    title,
    description: description || undefined,
    priority,
    deadline: deadline || undefined,
    assigneeId: assigneeId || undefined,
    teamId: teamId || undefined,
    projectId: projectId || undefined,
  });

  const buildFormData = (isUpdate: boolean) => {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('priority', priority);
    if (description) fd.append('description', description);
    if (deadline) fd.append('deadline', deadline);
    if (assigneeId) fd.append('assigneeId', assigneeId);
    if (teamId) fd.append('teamId', teamId);
    if (projectId) fd.append('projectId', projectId);
    if (isUpdate) fd.append('status', task?.status || 'todo');
    if (newFile) fd.append('file', newFile);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setError('Please select either an assignee or a team.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const isUpdate = !!task?.taskId;

      if (newFile) {
        // Uploading a new (or replacement) file
        const fd = buildFormData(isUpdate);
        if (isUpdate) {
          await api.tasks.updateWithFile(task!.taskId, fd);
        } else {
          await api.tasks.createWithFile(fd);
        }
      } else {
        // No file change
        const payload = buildPayload();
        if (isUpdate) {
          await api.tasks.update(task!.taskId, { ...payload, status: task?.status || 'todo' });
        } else {
          await api.tasks.create(payload);
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Failed to save task:', err);
      setError(err.message || 'An unexpected error occurred while saving the task.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Image zone rendering ─────────────────────────────────────────────────

  const renderImageZone = () => {
    // Priority 1: User has picked a new file — show its preview
    if (newFile && newFilePreviewUrl) {
      return (
        <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          <Box
            component="img"
            src={newFilePreviewUrl}
            alt="New attachment preview"
            sx={{ width: '100%', maxHeight: 250, objectFit: 'cover', display: 'block' }}
          />
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', px: 1, py: 0.5, borderRadius: 1 }}>
            New image selected
          </Typography>
          <IconButton
            size="small"
            color="error"
            onClick={handleRemoveNewFile}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
          >
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    // Priority 2: Task has an existing S3 image and user hasn't deleted it
    if (existingImageKey) {
      return (
        <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          <S3Image imageKey={existingImageKey} sx={{ width: '100%', maxHeight: 250 }} />
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            {/* Replace — opens file picker; old S3 key is kept server-side (versioning) */}
            <IconButton
              size="small"
              onClick={handleReplaceExisting}
              sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              title="Replace image"
            >
              <SwapHorizRounded fontSize="small" />
            </IconButton>
            {/* Delete — removes image from the form (old key stays in S3) */}
            <IconButton
              size="small"
              color="error"
              onClick={handleDeleteExisting}
              sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
              title="Remove image"
            >
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      );
    }

    // Priority 3: No image at all — show the drop zone
    return (
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'rgba(255, 255, 255, 0.15)',
          borderRadius: 2.5,
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          bgcolor: isDragging ? 'rgba(96, 165, 250, 0.08)' : 'rgba(255, 255, 255, 0.01)',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(96, 165, 250, 0.04)',
            boxShadow: 'inset 0 0 12px rgba(96, 165, 250, 0.03)',
          },
        }}
      >
        <CloudUploadRounded sx={{ fontSize: 42, color: 'primary.light', mb: 1.5, opacity: 0.85 }} />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
          Drag & drop your image here
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          or click to browse local files
        </Typography>
      </Box>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
          borderRadius: 3,
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxHeight: '90vh',
          height: '720px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        },
      }}
    >
      {/* Header - Fixed & Always Visible */}
      <DialogTitle
        component="div"
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(15, 23, 42, 0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary' }}>
            {task ? 'Edit Task' : 'Create New Task'}
          </Typography>
          {task && (
            <Box
              sx={{
                px: 1.5,
                py: 0.25,
                borderRadius: '9999px',
                bgcolor: 'action.selected',
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              Task ID: {task.taskId.slice(0, 8)}
            </Box>
          )}
        </Box>
        <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        {/* Scrollable Content Container */}
        <DialogContent sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
          {dataLoading ? (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Left Column Skeleton */}
              <Stack spacing={3} sx={{ flex: 1.3 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
                </Box>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1.5 }} />
              </Stack>

              {/* Splitter Skeleton */}
              <Box sx={{ width: '1px', bgcolor: 'divider', display: { xs: 'none', md: 'block' } }} />

              {/* Right Column Skeleton */}
              <Stack spacing={3} sx={{ flex: 0.7, minWidth: 280 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Stack>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, minHeight: '100%' }}>
              {/* Left Column — Form Fields */}
              <Box sx={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {error && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: 'error.light',
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}
                  >
                    {error}
                  </Box>
                )}

                <TextField
                  required
                  fullWidth
                  label="Task Title"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Deadline"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Assignee"
                    value={users.some(u => u.userId === assigneeId) ? assigneeId : ''}
                    onChange={(e) => {
                      setAssigneeId(e.target.value);
                      if (e.target.value) setTeamId('');
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {users
                      .filter(u => !teamId || u.teamId === teamId)
                      .map((u) => (
                        <MenuItem key={u.userId} value={u.userId}>{u.name}</MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Team"
                    value={teams.some(t => t.teamId === teamId) ? teamId : ''}
                    onChange={(e) => {
                      setTeamId(e.target.value);
                      if (e.target.value) setAssigneeId('');
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t.teamId} value={t.teamId}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  select
                  required={!task}
                  fullWidth
                  label="Project"
                  value={projects.some(p => p.projectId === projectId) ? projectId : ''}
                  onChange={(e) => setProjectId(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.projectId} value={p.projectId}>{p.name}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Vertical Splitter */}
              <Box sx={{ width: '1px', bgcolor: 'divider', display: { xs: 'none', md: 'block' }, alignSelf: 'stretch' }} />

              {/* Right Column — Attachment & Help Section */}
              <Box sx={{ flex: 0.7, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 280 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Task Attachment
                  </Typography>
                  {renderImageZone()}
                </Box>

                {/* Assignment Routing Helper Box */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, mb: 0.5 }}>
                    Assignment Routing Policy
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.45 }}>
                    A task can belong directly to an individual team member OR a whole team, but not both. Selecting an assignee clears the team routing, and vice versa.
                  </Typography>
                </Box>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Footer — Fixed & Always Visible */}
        <DialogActions
          sx={{
            p: 2.5,
            px: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(15, 23, 42, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button onClick={onClose} disabled={loading} sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || dataLoading || !canSubmit}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
            sx={{
              px: 3.5,
              borderRadius: 1.5,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.2)',
              }
            }}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
