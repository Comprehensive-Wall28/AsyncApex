import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import api from '../api';

interface S3ImageProps {
  imageKey: string;
  alt?: string;
  sx?: any;
}

export const S3Image: React.FC<S3ImageProps> = ({ imageKey, alt, sx }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageKey) return;

    let isMounted = true;
    const fetchUrl = async () => {
      try {
        setLoading(true);
        const response = await api.s3.getPresignedUrl(imageKey);
        if (isMounted) {
          setUrl(response.url);
          setError(false);
        }
      } catch (err) {
        console.error('Failed to fetch presigned URL for', imageKey, err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUrl();
    return () => { isMounted = false; };
  }, [imageKey]);

  if (loading) {
    return (
      <Box sx={{ ...sx, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      </Box>
    );
  }

  if (error || !url) {
    return (
      <Box sx={{ ...sx, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.75rem' }}>
        Failed to load image
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={url}
      alt={alt || 'Task attachment'}
      sx={{
        ...sx,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
};
