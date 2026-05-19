import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import api from '../api';

export interface S3ImageProps {
  imageKey: string;
  alt?: string;
  sx?: any;
  bucket?: string;
}

// Global cache for presigned URLs to prevent flickering on re-mounts
const urlCache: Record<string, { url: string; timestamp: number }> = {};
const CACHE_TTL = 3600 * 1000; // 1 hour

export const S3Image: React.FC<S3ImageProps> = ({ imageKey, alt, sx, bucket }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageKey) return;

    const cacheKey = bucket ? `${bucket}:${imageKey}` : imageKey;

    // Check cache
    const cached = urlCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      setUrl(cached.url);
      setLoading(false);
      setError(false);
      return;
    }

    let isMounted = true;
    const fetchUrl = async () => {
      try {
        setLoading(true);
        const response = await api.s3.getPresignedUrl(imageKey, bucket);
        if (isMounted) {
          setUrl(response.url);
          urlCache[cacheKey] = { url: response.url, timestamp: Date.now() };
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
  }, [imageKey, bucket]);

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
