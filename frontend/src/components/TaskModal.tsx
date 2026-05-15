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
import { CloseRounded, CloudUploadRounded, DeleteRounded } from '@mui/icons-material';
import api from '../api';
import type { Task, User, Team, Project } from '../api/interface';
import { S3Image } from './S3Image';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: Task; // If provided, edit mode
}

export const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, onSave, task }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [projectId, setProjectId] = useState('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority || 'medium');
        setDeadline(task.deadline ? String(task.deadline).split('T')[0] : '');
        setAssigneeId(task.assigneeId || '');
        setTeamId(task.teamId || '');
        setProjectId(task.projectId || '');
        setPreviewUrl(task.imageKey || null);
        setSelectedFile(null);
      } else {
        resetForm();
      }
    }
  }, [open, task]);

  const fetchDropdownData = async () => {
    try {
      setDataLoading(true);
      const [usersRes, teamsRes, projectsRes] = await Promise.all([
        api.users.getAll(),
        api.teams.getAll(),
        api.projects.getAll()
      ]);
      setUsers(usersRes as any);
      setTeams(teamsRes as any);
      setProjects(projectsRes as any);
    } catch (error) {
      console.error('Failed to load form data', error);
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
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(file.name);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(task?.imageKey || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priority) return;

    try {
      setLoading(true);
      
      const isUpdate = !!task?.taskId;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', title);
        if (description) formData.append('description', description);
        formData.append('priority', priority);
        if (deadline) formData.append('deadline', deadline);
        if (assigneeId) formData.append('assigneeId', assigneeId);
        
        if (!isUpdate) {
          if (teamId) formData.append('teamId', teamId);
          if (projectId) formData.append('projectId', projectId);
        } else {
          formData.append('status', task.status || 'todo');
        }
        
        formData.append('file', selectedFile);

        if (isUpdate) {
          await api.tasks.updateWithFile(task!.taskId, formData);
        } else {
          await api.tasks.createWithFile(formData);
        }
      } else {
        if (isUpdate) {
          const updatePayload = {
            title,
            description,
            priority,
            deadline: deadline || undefined,
            assigneeId: assigneeId || undefined,
            status: task.status || 'todo'
          };
          await api.tasks.update(task.taskId, updatePayload);
        } else {
          const createPayload = {
            title,
            description,
            priority,
            deadline: deadline || undefined,
            assigneeId: assigneeId || undefined,
            teamId: teamId || undefined,
            projectId: projectId || undefined
          };
          await api.tasks.create(createPayload);
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setLoading(false);
    }
  };

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
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
        } 
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
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u.userId} value={u.userId}>{u.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Team"
                    value={teams.some(t => t.teamId === teamId) ? teamId : ''}
                    onChange={(e) => setTeamId(e.target.value)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t.teamId} value={t.teamId}>{t.name}</MenuItem>
                    ))}
                  </TextField>
              </Box>

              <TextField
                select
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

              {/* Drag and Drop Zone */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Attachment (Image)</Typography>
                
                 {previewUrl && !selectedFile ? (
                   <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                     <S3Image imageKey={previewUrl} sx={{ width: '100%', maxHeight: 300 }} />
                     <IconButton size="small" color="error" onClick={() => { setPreviewUrl(null); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                       <DeleteRounded fontSize="small" />
                     </IconButton>
                   </Box>
                 ) : previewUrl && selectedFile ? (
                  <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    {selectedFile.type.startsWith('image/') ? (
                      <Box component="img" src={previewUrl} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography>{previewUrl}</Typography>
                      </Box>
                    )}
                    <IconButton size="small" color="error" onClick={handleRemoveFile} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragging ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isDragging ? 'action.hover' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <CloudUploadRounded sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                      Drag & Drop image here
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      or click to browse
                    </Typography>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </Box>
                )}
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
            disabled={loading || dataLoading || !title}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
