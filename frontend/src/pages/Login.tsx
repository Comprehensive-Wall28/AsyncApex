import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BoltRounded, LockOpenRounded } from '@mui/icons-material';
import api from '../api';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response: any = await api.auth.login(formData);
      if (response.idToken) {
        localStorage.setItem('idToken', response.idToken);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Column - Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 500px' },
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 4, md: 8 },
          py: 6,
          background: '#06060F',
          zIndex: 1,
          borderRight: { md: '1px solid rgba(139,92,246,0.12)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltRounded sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary' }}>
            AsyncApex
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#F1F0FF' }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5 }}>
            Access your enterprise dashboard and manage your workflows.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Work Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              sx={{ mb: 4 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Box component="span" onClick={() => navigate('/role-selection')} sx={{ color: '#A78BFA', cursor: 'pointer', fontWeight: 600, '&:hover': { color: '#C4B5FD' } }}>
                Sign up
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Column - Hero */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          background: '#0D0D1A',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          p: 8,
        }}
      >
        {/* Animated Background Orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            height: '80vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.04) 40%, transparent 60%)',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 3,
              background: 'linear-gradient(135deg, #F1F0FF 0%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            The future of asynchronous productivity.
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 4 }}>
            <Box>
              <Box sx={{ p: 3, background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '16px' }}>
                <Typography sx={{ color: '#A78BFA', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOpenRounded fontSize="small" /> Secure Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Enterprise-grade authentication with end-to-end encryption for your data.
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ p: 3, background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '16px' }}>
                <Typography sx={{ color: '#67E8F9', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BoltRounded fontSize="small" /> Lightning Fast
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Optimized for speed, giving you instant access to your tasks and team.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
