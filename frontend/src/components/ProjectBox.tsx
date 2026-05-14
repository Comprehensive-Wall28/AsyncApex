import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Chip, Stack, CircularProgress } from '@mui/material';
import api from '../api';
import type { Project } from '../api/interface';

interface ProjectBoxProps {
    teamId?: string;
    role: 'manager' | 'employee';
}

// Removed getPriorityColor

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

    useEffect(() => {
        fetchProjects();
    }, [teamId, role]);

    const handleDragStart = (e: React.DragEvent, projectId: string) => {
        e.dataTransfer.setData('projectId', projectId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const handleDrop = async (e: React.DragEvent, newStatus: Project['status']) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData('projectId');
        if (!projectId) return;

        const project = projects.find(t => t.projectId === projectId);
        if (!project || project.status === newStatus) return;

        // Optimistic update
        setProjects(prev => prev.map(t => t.projectId === projectId ? { ...t, status: newStatus } : t));

        try {
            if (project.status === 'todo' && newStatus === 'in-progress') await api.projects.start(projectId);
            else if (project.status === 'in-progress' && newStatus === 'in-review') await api.projects.submit(projectId);
            else if (project.status === 'in-review' && newStatus === 'done' && role === 'manager') await api.projects.approve(projectId);
            else if (project.status === 'in-review' && newStatus === 'in-progress' && role === 'manager') await api.projects.reject(projectId);
            else await api.projects.update(projectId, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status', error);
            fetchProjects(); // Revert on failure
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {columns.map(col => (
                <Box
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    sx={{
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        p: 2,
                        minHeight: 500,
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, px: 1, fontSize: '1.1rem', color: 'text.secondary' }}>
                        {col.title} <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.5 }}>({projects.filter(t => t.status === col.id).length})</Typography>
                    </Typography>

                    <Stack spacing={2}>
                        {projects.filter(t => t.status === col.id).map(project => (
                            <Card
                                key={project.projectId}
                                draggable
                                onDragStart={(e) => handleDragStart(e, project.projectId)}
                                sx={{
                                    p: 2,
                                    cursor: 'grab',
                                    background: 'rgba(13, 13, 26, 0.7)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '12px',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
                                }}
                            >

                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 100,
                                        borderRadius: '8px',
                                        mb: 2,
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'text.secondary',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    [S3 Image Placeholder]
                                </Box>
                                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>{project.name}</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Chip
                                        label={project.status.toUpperCase()}
                                        size="small"
                                        // color={getPriorityColor(project.status) as any}
                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                                    />
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.dark', fontSize: '0.7rem' }}>
                                        {project.managerId ? project.managerId.substring(0, 2).toUpperCase() : '?'}
                                    </Avatar>
                                </Box>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            ))}
        </Box>
    );
};
