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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Chip,
} from '@mui/material';
import { CloseRounded, SaveRounded } from '@mui/icons-material';
import type { Project, Team } from '../api/interface';
import api from '../api';

interface ProjectViewModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
  onSave?: (updated: { name: string; description: string; teamId: string }) => void;
  onDelete?: () => void;
  role?: string;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
  open, onClose, project, onSave, onDelete, role
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [description, setDescription] = useState(project?.description ?? '');
  const [teamIds, setTeamIds] = useState<string[]>(project?.teamIds ?? []);
  const [teams, setTeams] = useState<Team[]>([]);

  const isManager = role === 'manager';

  useEffect(() => {
    setDescription(project?.description ?? '');
    setTeamIds(project?.teamIds ?? []);
  }, [project]);

  useEffect(() => {
    if (open && isManager) {
      api.teams.getAll().then((data: any) => setTeams(data)).catch(() => {});
    }
  }, [open, isManager]);

  const handleSave = async () => {
    if (!project?.projectId) return;
    try {
      setIsSaving(true);
      await api.projects.update(project.projectId, { description, teamIds });
      onSave?.({ name: project.name, description, teamId: teamIds[0] ?? '' });
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {isManager ? (
            <FormControl fullWidth>
              <InputLabel>Teams</InputLabel>
              <Select
                multiple
                value={teamIds}
                label="Teams"
                onChange={(e) => setTeamIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => (
                      <Chip key={id} label={teams.find(t => t.teamId === id)?.name ?? id} size="small" />
                    ))}
                  </Box>
                )}
              >
                {teams.map((t) => (
                  <MenuItem key={t.teamId} value={t.teamId}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, fontSize: 12 }}>
                Teams
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {teamIds.length > 0
                  ? teamIds.map((id) => (
                      <Chip key={id} label={teams.find(t => t.teamId === id)?.name ?? id} size="small" />
                    ))
                  : <Typography variant="body2" color="text.secondary">—</Typography>
                }
              </Box>
            </Box>
          )}

          <Box>
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
          </Box>
        </Box>
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