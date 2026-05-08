import React from 'react';
import { Box, Typography, Button, Container, Stack, Chip } from '@mui/material';
import { ArrowForwardRounded, PlayArrowRounded } from '@mui/icons-material';

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'P95 Latency' },
  { value: '10M+', label: 'Tasks/day' },
];

export const Hero: React.FC = () => {
  return (
    <Box
      sx={{
        pt: { xs: 14, md: 20 },
        pb: { xs: 10, md: 14 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md">
        {/* Badge */}
        <Chip
          label="Now in Public Beta · Powered by AWS"
          size="small"
          sx={{
            mb: 4,
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#C4B5FD',
            fontWeight: 600,
            fontSize: '0.78rem',
            letterSpacing: '0.01em',
            height: 28,
            px: 0.5,
            '& .MuiChip-label': { px: 1.5 },
          }}
        />

        {/* Main headline */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.75rem' },
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            mb: 3,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'block',
              background: 'linear-gradient(135deg, #F1F0FF 0%, #E2D9F3 40%, #C4B5FD 80%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Scale workflows
          </Box>
          <Box
            component="span"
            sx={{
              display: 'block',
              background: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            without limits.
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            mb: 5,
            maxWidth: '620px',
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'text.secondary',
            fontSize: { xs: '1rem', md: '1.15rem' },
          }}
        >
          Enterprise-grade task orchestration on AWS. Built for teams who demand{' '}
          <Box component="span" sx={{ color: '#A78BFA', fontWeight: 600 }}>
            high availability
          </Box>
          {' '}and{' '}
          <Box component="span" sx={{ color: '#67E8F9', fontWeight: 600 }}>
            event-driven precision
          </Box>
          .
        </Typography>

        {/* CTA Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'center', mb: 8 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardRounded />}
            sx={{
              py: 1.6,
              px: 4,
              fontSize: '1rem',
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<PlayArrowRounded />}
            sx={{
              py: 1.6,
              px: 4,
              fontSize: '1rem',
            }}
          >
            Watch Demo
          </Button>
        </Stack>

        {/* Stats Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, md: 6 },
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #A78BFA, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Decorative orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, rgba(6,182,212,0.06) 50%, transparent 70%)',
          zIndex: -1,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          animation: 'orbFloat 8s ease-in-out infinite alternate',
          '@keyframes orbFloat': {
            '0%': { transform: 'translate(-50%, -50%) scale(1)' },
            '100%': { transform: 'translate(-50%, -48%) scale(1.06)' },
          },
        }}
      />
    </Box>
  );
};
