import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showText = true,
  textColor = 'text.primary',
  glow = true,
  onClick,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: size >= 32 ? 1.25 : 0.75,
        cursor: onClick ? 'pointer' : 'inherit',
      }}
    >
      {/* Premium SVG Vector Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: glow ? 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.45)) drop-shadow(0 2px 8px rgba(6, 182, 212, 0.35))' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <defs>
            {/* Gradient 1 (Left Wing/Peak): Electric Purple to Deep Violet */}
            <linearGradient id="apexGrad" x1="15%" y1="85%" x2="85%" y2="15%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>

            {/* Gradient 2 (Right Wing/Loop): Vibrant Teal to Cyber Cyan */}
            <linearGradient id="asyncGrad" x1="85%" y1="85%" x2="15%" y2="15%">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="60%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>

            {/* Glowing Inner Core: Cyber Neon Pink to Purple */}
            <linearGradient id="coreGrad" x1="30%" y1="70%" x2="70%" y2="30%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Background Tech Hexagon (Subtle, glassy structure) */}
          <path
            d="M 50,5 L 89,27.5 L 89,72.5 L 50,95 L 11,72.5 L 11,27.5 Z"
            fill="rgba(15, 23, 42, 0.4)"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Left Wing (The Ascent / Apex Peak) */}
          <path
            d="M 26,72 
               L 48,25
               C 49,23 51,23 52,25
               L 60,42
               L 48,42
               L 42,30
               L 32,52
               L 41,72
               Z"
            fill="url(#apexGrad)"
          />

          {/* Right Wing (The Loop / Async Flow) */}
          <path
            d="M 74,72
               L 52,25
               C 51,23 49,23 48,25
               L 40,42
               L 52,42
               L 58,30
               L 68,52
               L 59,72
               Z"
            fill="url(#asyncGrad)"
            opacity="0.85"
          />

          {/* The Inner Connection / Core Bolt (Active Jira Speed) */}
          <path
            d="M 39,51
               L 61,51
               L 43,71
               L 51,58
               L 34,58
               L 53,35
               L 46,46
               Z"
            fill="url(#coreGrad)"
          />
        </svg>
      </Box>

      {/* Brand Text */}
      {showText && (
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: size >= 32 ? '1.05rem' : '0.9rem',
            letterSpacing: '-0.02em',
            color: textColor,
            fontFamily: '"Outfit", "Inter", sans-serif',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <span style={{ fontWeight: 600 }}>Async</span>
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 850,
              ml: '0.05em',
            }}
          >
            Apex
          </Box>
        </Typography>
      )}
    </Box>
  );
};
