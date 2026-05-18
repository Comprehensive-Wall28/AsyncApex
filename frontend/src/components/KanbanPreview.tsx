import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Container, LinearProgress } from '@mui/material';
import { CircleRounded } from '@mui/icons-material';
import { tokens } from '../theme/theme';

// Semantic priority colours — centralized in tokens, not hardcoded inline.
const priorityConfig: Record<string, { color: string }> = {
  High:   { color: tokens.errorMain },
  Medium: { color: tokens.warningMain },
  Low:    { color: tokens.successMain },
};

const columns = [
  {
    title: 'To Do',
    accent: tokens.textSecondary,
    progress: 0,
    tasks: [
      { id: '1', title: 'Implement SQS listener', priority: 'High', tag: 'Backend' },
      { id: '2', title: 'Update IAM policies', priority: 'Medium', tag: 'Security' },
    ],
  },
  {
    title: 'In Progress',
    accent: tokens.primaryMain,
    progress: 45,
    tasks: [
      { id: '3', title: 'Optimize Lambda cold starts', priority: 'High', tag: 'Performance' },
      { id: '4', title: 'EventBridge rule mapping', priority: 'Medium', tag: 'Infra' },
    ],
  },
  {
    title: 'Done',
    accent: tokens.successMain,
    progress: 100,
    tasks: [
      { id: '5', title: 'Deploy core API', priority: 'Low', tag: 'Backend' },
      { id: '6', title: 'Setup VPC peering', priority: 'Medium', tag: 'Network' },
    ],
  },
];

export const KanbanPreview: React.FC = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Workflow Visualizer"
            size="small"
            sx={{
              mb: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              color: 'secondary.main',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Track every task,{' '}
            <Box component="span" sx={{ color: 'secondary.main' }}>
              in real time.
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
            Visualize your entire AWS workflow pipeline. Drag, prioritize, and monitor — all in one place.
          </Typography>
        </Box>

        {/* Kanban Board */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {columns.map((column) => (
            <Box key={column.title}>
              <Box
                sx={{
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                {/* Column Header */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircleRounded sx={{ fontSize: 9, color: column.accent }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
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
                        bgcolor: 'action.hover',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={column.progress}
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: column.accent,
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
                          cursor: 'grab',
                          transition: 'box-shadow 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
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
                                bgcolor: `${p.color}1A`,
                                border: `1px solid ${p.color}33`,
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
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'divider',
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
