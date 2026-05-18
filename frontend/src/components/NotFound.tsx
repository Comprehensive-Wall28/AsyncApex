// src/pages/NotFound.tsx
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { HomeRounded, SearchOffRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFound() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: '28px',
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 82,
                            height: 82,
                            mx: 'auto',
                            mb: 3,
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                        }}
                    >
                        <SearchOffRounded sx={{ fontSize: 42, color: '#fff' }} />
                    </Box>

                    <Typography
                        sx={{
                            fontSize: { xs: '4rem', md: '6rem' },
                            fontWeight: 900,
                            lineHeight: 1,
                            mb: 2,
                            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        404
                    </Typography>

                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Page not found
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            maxWidth: 520,
                            mx: 'auto',
                            mb: 4,
                            lineHeight: 1.7,
                        }}
                    >
                        The page you are trying to open does not exist or may have been moved.
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            flexDirection: { xs: 'column', sm: 'row' },
                        }}
                    >

                        <Button
                            component={RouterLink}
                            to="/"
                            variant="outlined"
                            startIcon={<HomeRounded />}
                            sx={{
                                px: 3,
                                py: 1.2,
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Back Home
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}