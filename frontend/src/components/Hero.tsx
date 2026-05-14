import React from 'react';
import { Box, Typography, Button, Container, Stack, Chip } from '@mui/material';
import { ArrowForwardRounded, PlayArrowRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'P95 Latency' },
  { value: '10M+', label: 'Tasks/day' },
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        pt: { xs: 14, md: 18 },
        pb: { xs: 10, md: 14 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        {/* Badge */}
        <Chip
          label="Now in Public Beta · Powered by AWS"
          size="small"
          sx={{
            mb: 4,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 28,
            px: 0.5,
            '& .MuiChip-label': { px: 1.5 },
          }}
        />

        {/* Main headline */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.5rem' },
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            mb: 3,
            color: 'text.primary',
          }}
        >
          Scale workflows{' '}
          <Box component="span" sx={{ color: 'secondary.main' }}>
            without limits.
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            mb: 5,
            maxWidth: '580px',
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.1rem' },
          }}
        >
          Enterprise-grade task orchestration on AWS. Built for teams who demand{' '}
          <Box component="span" sx={{ color: 'secondary.light', fontWeight: 600 }}>
            high availability
          </Box>{' '}
          and{' '}
          <Box component="span" sx={{ color: 'secondary.main', fontWeight: 600 }}>
            event-driven precision
          </Box>
          .
        </Typography>

        {/* CTA Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mb: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/role-selection')}
            endIcon={<ArrowForwardRounded />}
            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<PlayArrowRounded />}
            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
          >
            Watch Demo
          </Button>
        </Stack>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
          {stats.map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: 'secondary.main',
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
