import React from 'react';
import { Box, Typography, Card, CardContent, Container, Stack } from '@mui/material';
import { WorkRounded, PersonRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate('/signup', { state: { role } });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #F1F0FF 0%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Choose your path
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
            Select your role to configure your workspace.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ justifyContent: 'center' }}>
            {/* Manager Card */}
            <Card
              onClick={() => handleRoleSelect('manager')}
              sx={{
                flex: 1,
                maxWidth: 350,
                cursor: 'pointer',
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139,92,246,0.18)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(139,92,246,0.5)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(139,92,246,0.15)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 3,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(6,182,212,0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                >
                  <WorkRounded sx={{ fontSize: 32, color: '#C4B5FD' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#F1F0FF' }}>
                  Workspace Manager
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Create teams, manage projects, and oversee tasks across your organization.
                </Typography>
              </CardContent>
            </Card>

            {/* Employee Card */}
            <Card
              onClick={() => handleRoleSelect('employee')}
              sx={{
                flex: 1,
                maxWidth: 350,
                cursor: 'pointer',
                background: 'rgba(13,13,26,0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(6,182,212,0.18)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(6,182,212,0.5)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(6,182,212,0.15)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 3,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(6,182,212,0.3)',
                  }}
                >
                  <PersonRounded sx={{ fontSize: 32, color: '#67E8F9' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#F1F0FF' }}>
                  Team Member
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Join existing teams, complete tasks, and collaborate with coworkers.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* Decorative Background */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)',
          zIndex: -1,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};
