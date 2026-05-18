import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { AssessmentRounded } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Team } from './../api/interface';

export const Teams: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(Team)

  if (loading) return null; // Or a spinner

  const isManager = user?.role === 'manager';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Command Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1, color: 'text.primary' }}>
            Welcome back, {firstName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            {isManager ? "Here's the overview for the teams." : "Here is your team."}
          </Typography>
        </Box>

        {isManager && (
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<AssessmentRounded />} onClick={() => { navigate('/teams/new') }}>
              New Team
            </Button>
          </Stack>
        )}
      </Box>
    </Container>
  );
};
