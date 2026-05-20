import {
  Box,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import {
  DashboardRounded,
  GroupRounded,
  TaskAltRounded,
  CloudUploadRounded,
  NotificationsRounded,
  AnalyticsRounded,
} from '@mui/icons-material';
import { Navbar } from '../components/Navbar';

const features = [
  {
    title: 'Project Management',
    description: 'Create projects, organize work, and keep everything clear from one workspace.',
    icon: <DashboardRounded />,
  },
  {
    title: 'Team Collaboration',
    description: 'Assign teams, manage roles, and help members work together smoothly.',
    icon: <GroupRounded />,
  },
  {
    title: 'Task Tracking',
    description: 'Track task status, priority, assignees, deadlines, and progress.',
    icon: <TaskAltRounded />,
  },
  {
    title: 'S3 Image Uploads',
    description: 'Attach images to tasks and store them securely using AWS S3.',
    icon: <CloudUploadRounded />,
  },
  {
    title: 'Smart Notifications',
    description: 'Send updates and alerts using SNS, SQS, and EventBridge.',
    icon: <NotificationsRounded />,
  },
  {
    title: 'Cloud Monitoring',
    description: 'Monitor system activity and logs using AWS CloudWatch.',
    icon: <AnalyticsRounded />,
  },
];

export function Features() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          py: { xs: 8, md: 12 },
          background:
            'radial-gradient(circle at top left, rgba(124,58,237,0.18), transparent 35%), radial-gradient(circle at top right, rgba(6,182,212,0.14), transparent 30%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography
              sx={{
                mb: 2,
                fontWeight: 900,
                fontSize: { xs: '2.4rem', md: '4rem' },
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powerful features for modern teams
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 720,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.8,
              }}
            >
              AsyncApex combines projects, tasks, teams, cloud uploads,
              notifications, and monitoring into one clean platform.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {features.map((feature) => (
              <Paper
                key={feature.title}
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: '24px',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(139,92,246,0.16)',
                  backdropFilter: 'blur(10px)',
                  transition: '0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'rgba(6,182,212,0.45)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '16px',
                    mb: 2,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {feature.title}
                </Typography>

                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}