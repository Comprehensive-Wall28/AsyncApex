import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  AddRounded,
  SearchRounded,
  TuneRounded,
  CheckCircleRounded,
  FilterListRounded,
} from '@mui/icons-material';
import { MenuItem, Select, FormControl } from '@mui/material';

import { TaskBoard } from '../components/TaskBoard';
import { TaskModal } from '../components/TaskModal';
import { TaskViewModal } from '../components/TaskViewModal';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import type { Task, User, Team, Project } from '../api/interface';

export const Tasks: React.FC = () => {
  const { user, loading } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const [u, t, p] = await Promise.all([
          api.users.getAll(),
          api.teams.getAll(),
          api.projects.getAll()
        ]);
        setUsers(u as any);
        setTeams(t as any);
        setProjects(p as any);
      } catch (err) {
        console.error('Failed to fetch task page data', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;

  const isManager = user?.role === 'manager';

  const handleAddTask = (_status?: Task['status']) => {
    setSelectedTask(undefined);
    setIsTaskModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {/* Task Planner Header Section */}
      <Box sx={{
        mb: 6,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', lg: 'center' },
        gap: 4
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircleRounded sx={{ color: '#000', fontSize: 20 }} />
            </Box>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 800, color: 'text.primary' }}>
              Task Planner
            </Typography>
          </Box>

        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', lg: 'auto' }, alignItems: 'center' }}>
          <TextField
            placeholder="Search tasks..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          {isManager && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedTeamId || 'all'}
                onChange={(e) => setSelectedTeamId(e.target.value === 'all' ? undefined : e.target.value)}
                displayEmpty
                startAdornment={<FilterListRounded sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />}
                sx={{
                  borderRadius: '12px',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '& .MuiSelect-select': { py: 1, px: 2 },
                }}
                renderValue={(selected) => {
                  if (selected === 'all') return 'All Teams';
                  const team = teams.find(t => t.teamId === selected);
                  return team ? team.name : 'Unknown Team';
                }}
              >
                <MenuItem value="all">All Teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.teamId} value={team.teamId}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            startIcon={<TuneRounded />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'text.primary',
              whiteSpace: 'nowrap'
            }}
          >
            Sort by: <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>Manual</Box>
          </Button>

          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => handleAddTask()}
              sx={{
                borderRadius: '12px',
                bgcolor: '#fff',
                color: '#000',
                px: 3,
                fontWeight: 700,
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
            >
              New Task
            </Button>
          )}
        </Stack>
      </Box>

      {/* Kanban Board Container */}
      <Box>
        <TaskBoard
          teamId={isManager ? selectedTeamId : user?.teamId}
          role={user?.role || 'employee'}
          refreshKey={boardRefreshKey}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsViewModalOpen(true);
          }}
          onAddTask={handleAddTask}
        />
      </Box>

      {/* Modals */}
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
      />

      <TaskModal
        open={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={() => setBoardRefreshKey(prev => prev + 1)}
        task={selectedTask}
      />
    </Container>
  );
};

