import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Container, LinearProgress } from '@mui/material';
import { CircleRounded } from '@mui/icons-material';

const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
  High:   { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  Low:    { color: '#34D399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)'  },
};

const columns = [
  {
    title: 'To Do',
    accent: '#94A3B8',
    progress: 0,
    tasks: [
      { id: '1', title: 'Implement SQS listener', priority: 'High', tag: 'Backend' },
      { id: '2', title: 'Update IAM policies', priority: 'Medium', tag: 'Security' },
    ],
  },
  {
    title: 'In Progress',
    accent: '#8B5CF6',
    progress: 45,
    tasks: [
      { id: '3', title: 'Optimize Lambda cold starts', priority: 'High', tag: 'Performance' },
      { id: '4', title: 'EventBridge rule mapping', priority: 'Medium', tag: 'Infra' },
    ],
  },
  {
    title: 'Done',
    accent: '#34D399',
    progress: 100,
    tasks: [
      { id: '5', title: 'Deploy core API', priority: 'Low', tag: 'Backend' },
      { id: '6', title: 'Setup VPC peering', priority: 'Medium', tag: 'Network' },
    ],
  },
];

export const KanbanPreview: React.FC = () => {
  return (
    <Box sx={{ py: 10, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Workflow Visualizer"
            size="small"
            sx={{
              mb: 2,
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#A78BFA',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
            Track every task,{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in real time.
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
            Visualize your entire AWS workflow pipeline. Drag, prioritize, and monitor — all in one place.
          </Typography>
        </Box>

        {/* Kanban Board */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {columns.map((column) => (
            <Box key={column.title}>
              <Box
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(13, 13, 26, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                  '&:hover': {
                    borderColor: `${column.accent}40`,
                  },
                }}
              >
                {/* Column Header */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircleRounded sx={{ fontSize: 10, color: column.accent }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                        {column.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={column.tasks.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: 'rgba(139,92,246,0.12)',
                        color: '#A78BFA',
                        border: '1px solid rgba(139,92,246,0.2)',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={column.progress}
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${column.accent}, ${column.accent}99)`,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                {/* Tasks */}
                <Box sx={{ px: 2, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {column.tasks.map((task) => {
                    const p = priorityConfig[task.priority];
                    return (
                      <Card
                        key={task.id}
                        elevation={0}
                        sx={{
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          transition: 'all 0.2s ease',
                          cursor: 'grab',
                          '&:hover': {
                            background: 'rgba(139,92,246,0.06)',
                            borderColor: 'rgba(139,92,246,0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 1.5, lineHeight: 1.45, color: 'text.primary', fontSize: '0.85rem' }}
                          >
                            {task.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: p.color,
                                bgcolor: p.bg,
                                border: `1px solid ${p.border}`,
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                            <Chip
                              label={task.tag}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                                bgcolor: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                '& .MuiChip-label': { px: 1 },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
