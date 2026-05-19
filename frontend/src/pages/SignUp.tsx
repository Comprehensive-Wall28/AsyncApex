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
import { BoltRounded, CheckCircleOutlined, AutoAwesomeOutlined } from '@mui/icons-material';
import api from '../api';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'employee';

  const [formData, setFormData] = useState({ name: '', email: '', password: '', teamId: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/\d/.test(password)) return 'Password must contain at least one numeric character.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const passwordError = validatePassword(formData.password);
    if (passwordError) { setError(passwordError); return; }

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
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 8, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltRounded sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>
            AsyncApex
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75, color: 'text.primary' }}>
            Create your account
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Joining as a{' '}
            <Box component="span" sx={{ color: 'primary.light', fontWeight: 600, textTransform: 'capitalize' }}>
              {role}
            </Box>
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} fullWidth required variant="outlined" sx={{ mb: 2.5 }} />
            <TextField label="Work Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required variant="outlined" sx={{ mb: 2.5 }} />
            <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required variant="outlined" sx={{ mb: role === 'employee' ? 2.5 : 3 }} />

            {role === 'employee' && (
              <TextField
                label="Team ID (Optional)"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                helperText="Ask your manager for a Team ID to join instantly."
              />
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Already have an account?{' '}
            <Box
              component="span"
              onClick={() => navigate('/login')}
              sx={{ color: 'primary.light', cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
            >
              Log in
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
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'text.primary', lineHeight: 1.15 }}>
            Orchestrate tasks with{' '}
            <Box component="span" sx={{ color: 'secondary.main' }}>
              enterprise precision.
            </Box>
          </Typography>
          <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 5 }}>
            Deploy seamlessly with 99.99% uptime SLA backed by AWS infrastructure and real-time event-driven workflows.
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
              <Box sx={{ p: 1, bgcolor: 'action.selected', borderRadius: '6px', color: 'success.main', display: 'flex' }}>
                <CheckCircleOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary', fontSize: '0.9rem' }}>
                  High Availability
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Deploy seamlessly with 99.99% uptime SLA backed by AWS infrastructure.
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
                <AutoAwesomeOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary', fontSize: '0.9rem' }}>
                  Event-Driven Workflows
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
