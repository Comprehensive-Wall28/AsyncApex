import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Container } from '@mui/material';


const columns = [
  {
    title: 'To Do',
    tasks: [
      { id: '1', title: 'Implement SQS listener', priority: 'High' },
      { id: '2', title: 'Update IAM policies', priority: 'Medium' },
    ],
  },
  {
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'Optimize Lambda cold starts', priority: 'High' },
    ],
  },
  {
    title: 'Done',
    tasks: [
      { id: '4', title: 'Deploy core API', priority: 'Low' },
      { id: '5', title: 'Setup VPC peering', priority: 'Medium' },
    ],
  },
];

export const KanbanPreview: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'transparent' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Workflow Visualizer
        </Typography>
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
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  minHeight: '400px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {column.title}
                  <Chip label={column.tasks.length} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {column.tasks.map((task) => (
                    <Card 
                      key={task.id} 
                      elevation={0} 
                      sx={{ 
                        borderRadius: 3, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 20px rgba(0, 127, 255, 0.1)' }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          {task.title}
                        </Typography>
                        <Chip 
                          label={task.priority} 
                          size="small" 
                          color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'} 
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: '20px' }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
