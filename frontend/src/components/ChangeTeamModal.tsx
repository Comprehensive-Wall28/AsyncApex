import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
} from '@mui/material';
import api from '../api';
import type { Team, User } from '../api/interface';

interface ChangeTeamModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  teams: Team[];
  onSuccess: () => void;
}

export const ChangeTeamModal: React.FC<ChangeTeamModalProps> = ({ open, onClose, user, teams, onSuccess }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && user) {
      setSelectedTeamId(user.teamId || '');
      setError('');
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError('');
    setLoading(true);

    try {
      if (selectedTeamId) {
        await api.teams.addUser(selectedTeamId, user.userId);
      } else {
        // If the API supports unassigning, we would call it here.
        // For now, assuming move to another team.
        setError('Please select a team.');
        setLoading(false);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to change team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Team</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          {user && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Assign <strong>{user.name}</strong> to a new team.
            </Typography>
          )}
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="team-select-label">Select Team</InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeamId}
              label="Select Team"
              onChange={(e) => setSelectedTeamId(e.target.value as string)}
              required
            >
              {teams.map((team) => (
                <MenuItem key={team.teamId} value={team.teamId}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !selectedTeamId}>
            {loading ? 'Updating...' : 'Assign Team'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
