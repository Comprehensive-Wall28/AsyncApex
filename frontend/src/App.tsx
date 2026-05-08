import './App.css'
import { AppThemeProvider } from './theme/AppThemeProvider'
import { Box, Container, Typography } from '@mui/material'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { KanbanPreview } from './components/KanbanPreview'
import { FeatureGrid } from './components/FeatureGrid'
import { BoltRounded } from '@mui/icons-material'

function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Hero />
        <KanbanPreview />
        <FeatureGrid />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 5,
          borderTop: '1px solid rgba(139,92,246,0.12)',
          background: 'rgba(13,13,26,0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BoltRounded sx={{ color: '#fff', fontSize: 14 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                AsyncApex
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              © {new Date().getFullYear()} AsyncApex. Powered by AWS.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy', 'Terms', 'Status'].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'text.primary' },
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  )
}

export default App
