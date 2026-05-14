import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Chip, Stack, CircularProgress } from '@mui/material';
import api from '../api';
import type { Project } from '../api/interface';
import { tokens } from '../theme/theme';

interface ProjectBoxProps {
  teamId?: string;
  role: 'manager' | 'employee';
}

// Status colour mapping references centralized tokens.
const statusColorMap: Record<string, string> = {
  'todo':        tokens.textSecondary,
  'in-progress': tokens.primaryMain,
  'in-review':   tokens.warningMain,
  'done':        tokens.successMain,
};

export const ProjectBox: React.FC<ProjectBoxProps> = ({ teamId, role }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.getAll();
      setProjects(data as any);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [teamId, role]);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, newStatus: Project['status']) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;
    const project = projects.find(t => t.projectId === projectId);
    if (!project || project.status === newStatus) return;

    setProjects(prev => prev.map(t => t.projectId === projectId ? { ...t, status: newStatus } : t));

    try {
      if (project.status === 'todo' && newStatus === 'in-progress') await api.projects.start(projectId);
      else if (project.status === 'in-progress' && newStatus === 'in-review') await api.projects.submit(projectId);
      else if (project.status === 'in-review' && newStatus === 'done' && role === 'manager') await api.projects.approve(projectId);
      else if (project.status === 'in-review' && newStatus === 'in-progress' && role === 'manager') await api.projects.reject(projectId);
      else await api.projects.update(projectId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchProjects();
    }
  };

  const columns: { id: Project['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'in-review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      {columns.map(col => {
        const accent = statusColorMap[col.id] || tokens.textSecondary;
        return (
          <Box
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '8px',
              p: 2,
              minHeight: 500,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, px: 0.5, fontSize: '0.9rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {col.title}{' '}
              <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.6 }}>
                ({projects.filter(t => t.status === col.id).length})
              </Typography>
            </Typography>

            <Stack spacing={1.5}>
              {projects.filter(t => t.status === col.id).map(project => (
                <Card
                  key={project.projectId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.projectId)}
                  sx={{
                    p: 1.5,
                    cursor: 'grab',
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 80,
                      borderRadius: '6px',
                      mb: 1.5,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    [S3 Image Placeholder]
                  </Box>
                  <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.875rem', color: 'text.primary' }}>
                    {project.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={project.status.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: accent,
                        bgcolor: `${accent}1A`,
                        border: `1px solid ${accent}33`,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                    <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.dark', fontSize: '0.65rem', fontWeight: 700 }}>
                      {project.managerId ? project.managerId.substring(0, 2).toUpperCase() : '?'}
                    </Avatar>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
};
