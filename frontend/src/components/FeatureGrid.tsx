import React from 'react';
import { Box, Typography, Container, Chip } from '@mui/material';
import {
  Speed,
  NotificationsActive,
  Security,
  MemoryRounded,
  CloudDoneRounded,
  AutoGraphRounded,
} from '@mui/icons-material';
import { tokens } from '../theme/theme';

// Icon accent colours come from the centralized tokens object.
const features = [
  {
    title: 'High Availability',
    description:
      'Multi-region deployment with automated failover, health checks, and 99.99% uptime SLA backed by AWS infrastructure.',
    icon: CloudDoneRounded,
    accent: tokens.accentIndigo,
    tag: 'Infrastructure',
  },
  {
    title: 'Event-Driven Notifications',
    description:
      'Real-time updates via SQS, SNS, and EventBridge. Zero-polling architecture keeps your team in sync instantly.',
    icon: NotificationsActive,
    accent: tokens.accentCyan,
    tag: 'Messaging',
  },
  {
    title: 'Role-Based Security',
    description:
      'Fine-grained access control with AWS IAM and Cognito. Policy-as-code ensures your data stays protected.',
    icon: Security,
    accent: tokens.accentEmerald,
    tag: 'Security',
  },
  {
    title: 'Lambda Cold Start Optimizer',
    description:
      'Predictive warming strategies that keep your functions hot. Achieve sub-50ms P95 latency without paying for idle.',
    icon: Speed,
    accent: tokens.accentAmber,
    tag: 'Performance',
  },
  {
    title: 'Smart Task Routing',
    description:
      'Intelligent queue routing with priority lanes, dead-letter handling, and exponential backoff retry policies.',
    icon: AutoGraphRounded,
    accent: tokens.accentPink,
    tag: 'Orchestration',
  },
  {
    title: 'Serverless Compute',
    description:
      'Scale from zero to millions of tasks with no infrastructure management. Pay only for what you actually use.',
    icon: MemoryRounded,
    accent: tokens.accentViolet,
    tag: 'Compute',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <Box sx={{ py: 12 }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 9 }}>
          <Chip
            label="Features"
            size="small"
            sx={{
              mb: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              color: 'secondary.main',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Built for the{' '}
            <Box component="span" sx={{ color: 'secondary.main' }}>
              AWS Ecosystem.
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Every feature is designed to leverage native AWS services — giving you enterprise power without the
            enterprise complexity.
          </Typography>
        </Box>

        {/* Feature cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Box
                key={feature.title}
                sx={{
                  p: 3,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    bgcolor: `${feature.accent}1A`, // 10% opacity
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                    border: `1px solid ${feature.accent}33`, // 20% opacity border
                  }}
                >
                  <Icon sx={{ color: feature.accent, fontSize: 22 }} />
                </Box>

                {/* Tag */}
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: 0.75,
                  }}
                >
                  {feature.tag}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '0.95rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.85rem' }}>
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
