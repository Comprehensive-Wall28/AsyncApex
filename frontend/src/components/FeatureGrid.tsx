import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Speed, NotificationsActive, Security } from '@mui/icons-material';

const features = [
  {
    title: 'High Availability',
    description: 'Multi-region deployment with automated failover and 99.99% uptime SLA.',
    icon: <Speed sx={{ fontSize: 40, color: '#007FFF' }} />,
  },
  {
    title: 'Event-Driven Notifications',
    description: 'Real-time updates via SQS, SNS, and EventBridge integration.',
    icon: <NotificationsActive sx={{ fontSize: 40, color: '#007FFF' }} />,
  },
  {
    title: 'Role-Based Security',
    description: 'Fine-grained access control integrated with AWS IAM and Cognito.',
    icon: <Security sx={{ fontSize: 40, color: '#007FFF' }} />,
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <Box sx={{ py: 10, bgcolor: 'transparent' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ fontWeight: 700, mb: 6 }}
        >
          Built for the AWS Ecosystem
        </Typography>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 4 
          }}
        >
          {features.map((feature) => (
            <Box key={feature.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
