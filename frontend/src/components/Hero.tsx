import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';

export const Hero: React.FC = () => {
  return (
    <Box
      sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 10 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '4.5rem' },
            fontWeight: 800,
            mb: 2,
            letterSpacing: '0.05em',
            background: 'linear-gradient(45deg, #007FFF 30%, #00D2FF 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AsyncApex
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 4,
            maxWidth: '700px',
            mx: 'auto',
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          Enterprise-grade task management on AWS. Scale your workflows with high availability and event-driven precision.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              border: '1px solid #1e293b'
            }}
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              border: '1px solid #1e293b',
              '&:hover': {
                border: '1px solid #1e293b',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            View Documentation
          </Button>
        </Stack>
      </Container>
      
      {/* Decorative background element */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.1,
          background: 'radial-gradient(circle, #007FFF 0%, transparent 70%)',
        }}
      />
    </Box>
  );
};
