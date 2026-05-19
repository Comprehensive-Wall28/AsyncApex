import React from 'react';
import { Box, Typography, Card, CardContent, Container, Stack } from '@mui/material';
import { WorkRounded, PersonRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

const roles = [
  {
    key: 'manager',
    title: 'Workspace Manager',
    description: 'Create teams, manage projects, and oversee tasks across your organization.',
    icon: WorkRounded,
    accent: 'primary.light',
    accentBg: 'action.selected',
  },
  {
    key: 'employee',
    title: 'Team Member',
    description: 'Join existing teams, complete tasks, and collaborate with coworkers.',
    icon: PersonRounded,
    accent: 'secondary.main',
    accentBg: 'action.selected',
  },
];

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 10 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
              Choose your path
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1.05rem' }}>
              Select your role to configure your workspace.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'center' }}>
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.key}
                  onClick={() => navigate('/signup', { state: { role: role.key } })}
                  sx={{
                    flex: 1,
                    maxWidth: 360,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 3,
                        borderRadius: '10px',
                        bgcolor: role.accentBg,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 30, color: role.accent }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
                      {role.description}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
