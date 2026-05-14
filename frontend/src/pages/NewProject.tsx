import React, { useState } from 'react';
import {
    Box, Button, Typography, CircularProgress,
    TextField, Alert, IconButton, Stack,
} from '@mui/material';
import {
    ArrowBackRounded,
    RocketLaunchRounded,
    AttachMoneyRounded,
    CalendarMonthRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

export const NewProject: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [endDate, setEndDate] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isManager = user?.role === 'manager';

    const handleCreateProject = async () => {
        if (!name.trim() || !description.trim()) {
            setError('Please fill in the project name and description.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await api.projects.create({
                name: name.trim(),
                description: description.trim(),
                budget: budget ? parseFloat(budget) : undefined,
                endDate: endDate || undefined,
            });
            navigate('/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return null;

    // Shared styles
    const glassCard = {
        background: 'rgba(13, 13, 26, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        borderRadius: '20px',
        p: { xs: 3, md: 5 },
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s ease',
            '& fieldset': {
                borderColor: 'rgba(139, 92, 246, 0.2)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(139, 92, 246, 0.4)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#7C3AED',
                boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.15)',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'text.secondary',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#A78BFA',
        },
    };
    // At the top of your component logic
    if (!authLoading && !isManager) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="warning">You do not have permission to create projects.</Alert>
                <Button onClick={() => navigate('/projects')}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 820, mx: 'auto', mt: 4, px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
            {/* Ambient glow effects (optional, keeping them inside the content area) */}
            <Box sx={{
                position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: -1,
            }} />

            {/* Back navigation */}
            <Box sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate('/projects')}
                    sx={{
                        color: 'text.secondary',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        px: 2,
                        py: 1,
                        '&:hover': {
                            background: 'rgba(255,255,255,0.05)',
                        },
                    }}
                >
                    <ArrowBackRounded sx={{ mr: 1, fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Back to Projects</Typography>
                </IconButton>
            </Box>

            {/* Page Header */}
            <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: '14px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
                    }}>
                        <RocketLaunchRounded sx={{ color: '#fff', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800,
                            background: 'linear-gradient(135deg, #F1F0FF 0%, #06B6D4 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            New Project
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                            Set up a new project for your team
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{
                        mb: 4, borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#FCA5A5',
                        '& .MuiAlert-icon': { color: '#EF4444' },
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Form Card */}
            <Box sx={glassCard}>
                <Stack spacing={4}>
                    {/* Project Name */}
                    <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#A78BFA', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Project Details
                        </Typography>
                        <TextField
                            fullWidth
                            label="Project Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Website Redesign Q3"
                            sx={inputSx}
                        />
                    </Box>

                    {/* Description */}
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the scope, goals, and deliverables of this project..."
                        sx={inputSx}
                    />

                    {/* Budget & End Date row */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Budget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="0.00"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <AttachMoneyRounded sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                input: {
                                    startAdornment: (
                                        <CalendarMonthRounded sx={{ color: 'text.secondary', mr: 0.5, fontSize: 20 }} />
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                    </Box>
                </Stack>
            </Box>

            {/* Action Bar */}
            <Box sx={{
                display: 'flex', justifyContent: 'flex-end', gap: 2,
                mt: 4, pt: 3,
            }}>
                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/projects')}
                    sx={{
                        borderRadius: '12px', px: 4, py: 1.5,
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                        color: 'text.secondary',
                        '&:hover': {
                            borderColor: 'rgba(148, 163, 184, 0.5)',
                            background: 'rgba(255,255,255,0.05)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    onClick={handleCreateProject}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <RocketLaunchRounded />}
                    sx={{
                        borderRadius: '12px', px: 4, py: 1.5,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
                        fontWeight: 700,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)',
                            transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                            background: 'rgba(139, 92, 246, 0.3)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    {submitting ? 'Creating...' : 'Create Project'}
                </Button>
            </Box>
        </Box>
    );
};