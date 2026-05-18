import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
} from '@mui/material';
import { CloseRounded, SaveRounded } from '@mui/icons-material';
import type { Project } from '../api/interface';
import api from '../api';

interface ProjectViewModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
  onSave?: (updated: { name: string; description: string }) => void;
  onDelete?: () => void;
  role?: string;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
  open, onClose, project, onSave, onDelete
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [description, setDescription] = useState(project?.description ?? '');

  // Sync when project changes
  useEffect(() => {
    setDescription(project?.description ?? '');
  }, [project]);

  const handleSave = async () => {
    if (!project?.projectId) return;
    try {
      setIsSaving(true);
      await api.projects.update(project.projectId, { description });
      onSave?.({ name: project.name, description });  // triggers refreshKey++
      onClose();
    } catch (err) {
      console.error('Failed to update project', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project?.projectId) return;
    try {
      setIsDeleting(true);
      await api.projects.delete(project.projectId);
      onDelete?.();   // triggers refreshKey++
      onClose();
    } catch (err) {
      console.error('Failed to delete project', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: 'background.paper', maxHeight: '90vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
        {project?.name ?? 'Project Details'}
        <IconButton onClick={onClose} size="small">
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="overline" color="text.secondary"
          sx={{ display: 'block', mb: 1, fontWeight: 800, fontSize: 16 }}
        >
          Description
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.03)',
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveRounded />}
          disabled={isSaving}
          sx={{ borderRadius: 2, color: 'black' }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="outlined"
          disabled={isDeleting}
          sx={{ borderRadius: 2, borderColor: '#F44336', color: '#F44336' }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};