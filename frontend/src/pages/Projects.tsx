import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Container,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  AddRounded,
  SearchRounded,
  TuneRounded,
  CheckCircleRounded,
  FilterListRounded,
  FolderOpenRounded,
  GroupRounded,
} from '@mui/icons-material';
import { MenuItem, Select, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import api from '../api';
import type { Project, Team } from '../api/interface';
import { ProjectViewModal } from '../components/ProjectViewModal';

export const Projects: React.FC = () => {
  const { user, loading } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const [t, p] = await Promise.all([
          api.teams.getAll(),
          api.projects.getAll()
        ]);
        setTeams(t as any);
        setProjects(p as any);
      } catch (err) {
        console.error('Failed to fetch project page data', err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  if (loading) return null;

  const isManager = user?.role === 'manager';

  // --- Filter and Search Logic ---
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTeam = !selectedTeamId || (project.teamIds ?? []).includes(selectedTeamId);

    return matchesSearch && matchesTeam;
  });

  const getTeamNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return 'No Team Assigned';
    return ids.map(id => teams.find(t => t.teamId === id)?.name ?? 'Unknown').join(', ');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {/* Project Planner Header Section */}
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
              {isManager ? "Project Planner" : "Projects"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', lg: 'auto' }, alignItems: 'center' }}>
          <TextField
            placeholder="Search projects..."
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
              onClick={() => navigate('/projects/new')}
              sx={{
                borderRadius: '12px',
                bgcolor: '#fff',
                color: '#000',
                px: 3,
                fontWeight: 700,
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
            >
              New Project
            </Button>
          )}
        </Stack>
      </Box>

      {/* --- Projects Grid Display Section --- */}
      {isDataLoading ? (
        // Skeleton Loaders while fetching
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={n}>
              <Skeleton
                variant="rounded"
                height={200}
                sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.03)' }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredProjects.length === 0 ? (
        // Empty State
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <FolderOpenRounded sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom> No Projects Found </Typography>
          <Typography variant="body2" color="text.secondary"> Try adjusting your search keywords or team filters. </Typography>
        </Box>
      ) : (
        // Active Projects Grid Layout
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.projectId}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                  borderColor: 'rgba(255,255,255,0.15)'
                }
              }}>
                <CardContent onClick={() => {
                  setSelectedProject(project);
                  setViewOpen(true)
                }} sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
                      {project.name}
                    </Typography>
                    <Chip
                      label="Active"
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'text.primary', fontWeight: 600, borderRadius: '6px' }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px' }}>
                    {project.description || 'No description provided.'}
                  </Typography>

                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <GroupRounded sx={{ fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {getTeamNames(project.teamIds)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSelectedProject(project);
                      setViewOpen(true)
                    }}
                    sx={{
                      borderRadius: '10px',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'text.primary',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <ProjectViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        project={selectedProject}
        role={isManager ? 'manager' : 'employee'}
        onSave={() => setRefreshKey(k => k + 1)}
        onDelete={() => setRefreshKey(k => k + 1)}
      />
    </Container >
  );
};