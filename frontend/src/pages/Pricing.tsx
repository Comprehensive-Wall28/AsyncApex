import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { CheckCircleRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Best for testing the platform and small personal projects.',
    features: [
      'Basic project management',
      'Task tracking',
      'Team preview',
      'Limited storage',
    ],
    highlighted: false,
  },
  {
    name: 'Team',
    price: '$12',
    description: 'Best for student teams, startups, and active project groups.',
    features: [
      'Unlimited projects',
      'Team collaboration',
      'Task image uploads',
      'Notifications',
      'Cloud monitoring',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Best for larger organizations that need advanced cloud support.',
    features: [
      'Advanced permissions',
      'Custom AWS setup',
      'Priority support',
      'Security monitoring',
      'Scalable deployment',
    ],
    highlighted: false,
  },
];

export function Pricing() {
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
              Simple pricing
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
              Choose the plan that fits your team. Start small and upgrade when
              your workspace grows.
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.name}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: '28px',
                    bgcolor: plan.highlighted
                      ? 'rgba(124,58,237,0.12)'
                      : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: plan.highlighted
                      ? 'rgba(6,182,212,0.45)'
                      : 'rgba(139,92,246,0.16)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                  }}
                >
                  {plan.highlighted && (
                    <Chip
                      label="Most Popular"
                      sx={{
                        mb: 2,
                        color: '#fff',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                      }}
                    />
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                    {plan.name}
                  </Typography>

                  <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                    {plan.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography sx={{ fontSize: '3rem', fontWeight: 900 }}>
                      {plan.price}
                    </Typography>
                    {plan.price !== 'Custom' && (
                      <Typography color="text.secondary" sx={{ ml: 1 }}>
                        / month
                      </Typography>
                    )}
                  </Box>

                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} disableGutters>
                        <ListItemIcon sx={{ minWidth: 34 }}>
                          <CheckCircleRounded sx={{ color: '#06B6D4', fontSize: 21 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            color: 'text.secondary',
                            fontSize: '0.95rem',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    component={RouterLink}
                    to="/signup"
                    fullWidth
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    sx={{
                      py: 1.2,
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 800,
                      ...(plan.highlighted && {
                        background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                      }),
                    }}
                  >
                    Get Started
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}