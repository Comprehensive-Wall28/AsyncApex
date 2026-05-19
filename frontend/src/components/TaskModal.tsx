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
  const hasExactlyOneAssignment = hasAssignee !== hasTeam;
  const canSubmit = !!title && !!priority && !!projectId && hasExactlyOneAssignment;

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
      setError('Please choose either an assignee or a team, not both.');
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
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragging ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        }}
      >
        <CloudUploadRounded sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
          Drag & drop an image here
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          or click to browse
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
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        },
      }}
    >
      <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {task ? 'Edit Task' : 'Create New Task'}
        </Typography>
        <IconButton onClick={onClose} disabled={loading} size="small">
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'divider', p: 3 }}>
          {dataLoading ? (
            <Stack spacing={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : (
            <Stack spacing={3}>
              {error && (
                <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white', borderRadius: 1, fontSize: '0.875rem' }}>
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
              />

              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.projectId} value={p.projectId}>{p.name}</MenuItem>
                ))}
              </TextField>

              {/* Image upload zone */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Attachment (Image)
                </Typography>
                {renderImageZone()}
                {/* Single hidden file input — shared across all scenarios */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || dataLoading || !canSubmit}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
