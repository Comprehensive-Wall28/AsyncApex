import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import {
  LoginRounded,
  FolderRounded,
  TaskRounded,
  GroupsRounded,
  ImageRounded,
  CloudRounded,
} from '@mui/icons-material';
import { Navbar } from '../components/Navbar';

const docs = [
  {
    title: 'Authentication',
    description: 'Users can sign up, log in, and access protected dashboard routes.',
    icon: <LoginRounded />,
    tag: 'Auth',
  },
  {
    title: 'Projects',
    description: 'Create, view, update, and manage projects inside the workspace.',
    icon: <FolderRounded />,
    tag: 'CRUD',
  },
  {
    title: 'Tasks',
    description: 'Tasks include status, priority, assignee, team, deadline, and image support.',
    icon: <TaskRounded />,
    tag: 'Core',
  },
  {
    title: 'Teams',
    description: 'Teams group users together and allow task assignment by team.',
    icon: <GroupsRounded />,
    tag: 'Collaboration',
  },
  {
    title: 'Image Uploads',
    description: 'Images are uploaded to S3 and linked to their related tasks.',
    icon: <ImageRounded />,
    tag: 'S3',
  },
  {
    title: 'AWS Services',
    description: 'The platform uses DynamoDB, S3, Lambda, SNS, SQS, EventBridge, and CloudWatch.',
    icon: <CloudRounded />,
    tag: 'Cloud',
  },
];

export function Documentation() {
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
              Documentation
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
              A simple overview of how AsyncApex is structured and how the main
              platform modules work together.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {docs.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.title}>
                <Paper
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      {doc.icon}
                    </Box>

                    <Chip
                      label={doc.tag}
                      size="small"
                      sx={{
                        color: 'text.primary',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {doc.title}
                  </Typography>

                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {doc.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}