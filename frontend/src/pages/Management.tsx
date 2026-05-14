import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { AddRounded, EditRounded, DeleteRounded } from '@mui/icons-material';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useAuth } from '../hooks/useAuth';
import { TeamModal } from '../components/TeamModal';
import { ProjectModal } from '../components/ProjectModal';
import api from '../api';

export const Management: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const isManager = user?.role === 'manager';

  const fetchData = async () => {
    setDataLoading(true);
    try {
      if (tabValue === 0) {
        const res = await api.teams.getAll();
        setTeams((res as any) || []);
      } else {
        const res = await api.projects.getAll();
        setProjects((res as any) || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) {
      fetchData();
    }
  }, [tabValue, isManager]);

  const handleDeleteTeam = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await api.teams.delete(id);
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.projects.delete(id);
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (authLoading) return null;

  if (!isManager) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" color="error">Access Denied. Managers only.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CollapsibleSidebar userName={user?.name} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 0.25s ease',
          width: `calc(100% - ${sidebarCollapsed ? 64 : 240}px)`,
          pb: 10,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 8 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '2.25rem', color: 'text.primary', fontWeight: 800 }}>
              Management Console
            </Typography>
            {tabValue === 0 ? (
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setSelectedTeam(null); setTeamModalOpen(true); }}>
                Create Team
              </Button>
            ) : (
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setSelectedProject(null); setProjectModalOpen(true); }}>
                Create Project
              </Button>
            )}
          </Box>

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mb: 4 }}
          >
            <Tab label="Teams" sx={{ fontWeight: 'bold' }} />
            <Tab label="Projects" sx={{ fontWeight: 'bold' }} />
          </Tabs>

          {dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabValue === 0 && teams.map((team) => (
                    <TableRow key={team.teamId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {team.name}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{team.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => { setSelectedTeam(team); setTeamModalOpen(true); }}>
                          <EditRounded />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteTeam(team.teamId)}>
                          <DeleteRounded />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tabValue === 0 && teams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No teams found.</TableCell>
                    </TableRow>
                  )}

                  {tabValue === 1 && projects.map((project) => (
                    <TableRow key={project.projectId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {project.name}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{project.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => { setSelectedProject(project); setProjectModalOpen(true); }}>
                          <EditRounded />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteProject(project.projectId)}>
                          <DeleteRounded />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tabValue === 1 && projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No projects found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Container>
      </Box>

      {/* Modals */}
      <TeamModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        team={selectedTeam}
        onSuccess={fetchData}
      />
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={selectedProject}
        onSuccess={fetchData}
      />
    </Box>
  );
};
