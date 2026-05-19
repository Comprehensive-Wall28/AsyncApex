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
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '8px',
          bgcolor: 'action.selected',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.primary', fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Typography sx={{ color: trendColor, fontSize: '0.8rem', fontWeight: 600, mt: 0.75 }}>
            {trend}
          </Typography>
        )}
      </Box>
    </Card>
  );
};
