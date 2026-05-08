import React from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';
import { Speed, NotificationsActive, Security, MemoryRounded, CloudDoneRounded, AutoGraphRounded } from '@mui/icons-material';

const features = [
  {
    title: 'High Availability',
    description: 'Multi-region deployment with automated failover, health checks, and 99.99% uptime SLA backed by AWS infrastructure.',
    icon: CloudDoneRounded,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    glow: 'rgba(139, 92, 246, 0.25)',
    tag: 'Infrastructure',
  },
  {
    title: 'Event-Driven Notifications',
    description: 'Real-time updates via SQS, SNS, and EventBridge. Zero-polling architecture keeps your team in sync instantly.',
    icon: NotificationsActive,
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    glow: 'rgba(6, 182, 212, 0.25)',
    tag: 'Messaging',
  },
  {
    title: 'Role-Based Security',
    description: 'Fine-grained access control with AWS IAM and Cognito. Policy-as-code ensures your data stays protected.',
    icon: Security,
    gradient: 'linear-gradient(135deg, #34D399, #10B981)',
    glow: 'rgba(52, 211, 153, 0.25)',
    tag: 'Security',
  },
  {
    title: 'Lambda Cold Start Optimizer',
    description: 'Predictive warming strategies that keep your functions hot. Achieve sub-50ms P95 latency without paying for idle.',
    icon: Speed,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    glow: 'rgba(245, 158, 11, 0.25)',
    tag: 'Performance',
  },
  {
    title: 'Smart Task Routing',
    description: 'Intelligent queue routing with priority lanes, dead-letter handling, and exponential backoff retry policies.',
    icon: AutoGraphRounded,
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    glow: 'rgba(236, 72, 153, 0.25)',
    tag: 'Orchestration',
  },
  {
    title: 'Serverless Compute',
    description: 'Scale from zero to millions of tasks with no infrastructure management. Pay only for what you actually use.',
    icon: MemoryRounded,
    gradient: 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
    glow: 'rgba(167, 139, 250, 0.25)',
    tag: 'Compute',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <Box sx={{ py: 12, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 9 }}>
          <Chip
            label="Features"
            size="small"
            sx={{
              mb: 2,
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              color: '#67E8F9',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.03em' }}>
            Built for the{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AWS Ecosystem.
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Every feature is designed to leverage native AWS services — giving you enterprise power without the enterprise complexity.
          </Typography>
        </Box>

        {/* Feature cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Box
                key={feature.title}
                sx={{
                  p: 3.5,
                  borderRadius: '16px',
                  background: 'rgba(13, 13, 26, 0.7)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.35)',
                    transform: 'translateY(-4px)',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.15)`,
                  },
                  '&:hover .feature-glow': {
                    opacity: 1,
                  },
                }}
              >
                {/* Hover glow background */}
                <Box
                  className="feature-glow"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: feature.glow,
                    filter: 'blur(30px)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                />

                {/* Icon */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                    boxShadow: `0 4px 16px ${feature.glow}`,
                  }}
                >
                  <Icon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>

                {/* Tag */}
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  {feature.tag}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.01em', fontSize: '1rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.875rem' }}>
                  {feature.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};
