import React from 'react';
import { Card, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendColor = 'success.main' }) => {
  return (
    <Card
      sx={{
        p: 3,
        background: 'rgba(13, 13, 26, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.18)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.primary', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Typography sx={{ color: trendColor, fontSize: '0.8rem', fontWeight: 600, mt: 1 }}>
            {trend}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
