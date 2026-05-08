import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { CloudQueue } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        top: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(5, 10, 21, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Left Side: Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudQueue sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.02em', 
                color: 'text.primary',
                fontSize: '1.25rem'
              }}
            >
              AsyncApex
            </Typography>
          </Box>

          {/* Right Side: Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button color="inherit" sx={{ fontWeight: 500 }}>Features</Button>
              <Button color="inherit" sx={{ fontWeight: 500 }}>Documentation</Button>
            </Box>

            <Button 
              variant="contained" 
              color="primary"
              sx={{ 
                borderRadius: '8px', 
                px: 3, 
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
