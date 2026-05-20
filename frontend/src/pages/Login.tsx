import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, FlashOnOutlined } from '@mui/icons-material';
import api from '../api';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
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

      // 👇 Replace navigate('/dashboard') with this
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Left Column — Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 4, md: 7 },
          py: 5,
          bgcolor: 'background.paper',
          borderRight: { md: '1px solid' },
          borderColor: { md: 'divider' },
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 10 }}>
          <Logo size={28} onClick={() => navigate('/')} />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: 380,
            width: '100%',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75, color: 'text.primary' }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Access your enterprise dashboard and manage your workflows.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
              sx={{ mb: 2.5 }}
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Box
              component="span"
              onClick={() => navigate('/role-selection')}
              sx={{ color: 'primary.light', cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
            >
              Sign up
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* Right Column — Brand Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 8,
          bgcolor: 'background.default',
          gap: 4,
        }}
      >
        <Box sx={{ maxWidth: 460 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, mb: 2, color: 'text.primary', lineHeight: 1.15 }}
          >
            The future of asynchronous{' '}
            <Box component="span" sx={{ color: 'secondary.main' }}>
              productivity.
            </Box>
          </Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 5 }}>
            Enterprise-grade task orchestration with 99.99% uptime, event-driven architecture, and fine-grained access control.
          </Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: '6px', color: 'primary.light', display: 'flex' }}>
                <LockOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary', fontSize: '0.9rem' }}>
                  Secure Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Enterprise-grade authentication with end-to-end encryption for your data.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: '6px', color: 'secondary.main', display: 'flex' }}>
                <FlashOnOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary', fontSize: '0.9rem' }}>
                  Lightning Fast
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
