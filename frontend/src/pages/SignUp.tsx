import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { BoltRounded } from '@mui/icons-material';
import api from '../api';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'employee';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/\d/.test(password)) return "Password must contain at least one numeric character.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await api.auth.signup({ ...formData, role });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
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
            Create your account
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Join AsyncApex as a <Box component="span" sx={{ color: '#A78BFA', fontWeight: 600, textTransform: 'capitalize' }}>{role}</Box>
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              sx={{ mb: 3 }}
            />
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
              sx={{ mb: 3 }}
            />
            
            {role === 'employee' && (
              <TextField
                label="Team ID (Optional)"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 4 }}
                helperText="Ask your manager for a Team ID to join instantly."
              />
            )}

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
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <Box component="span" onClick={() => navigate('/login')} sx={{ color: '#A78BFA', cursor: 'pointer', fontWeight: 600, '&:hover': { color: '#C4B5FD' } }}>
                Log in
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Column - Animated Hero */}
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
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            height: '80vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.05) 40%, transparent 60%)',
            zIndex: 0,
            animation: 'orbFloat 10s ease-in-out infinite alternate',
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
            Orchestrate tasks with enterprise precision.
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 4 }}>
            <Box>
              <Box sx={{ p: 3, background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '16px' }}>
                <Typography sx={{ color: '#34D399', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BoltRounded fontSize="small" /> High Availability
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Deploy seamlessly with 99.99% uptime SLA backed by AWS infrastructure.
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ p: 3, background: 'rgba(13,13,26,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '16px' }}>
                <Typography sx={{ color: '#67E8F9', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BoltRounded fontSize="small" /> Event-Driven Workflows
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Build automated pipelines that react to changes in real-time.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
