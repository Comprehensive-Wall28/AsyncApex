import './App.css'
import { AppThemeProvider } from './theme/AppThemeProvider'
import { Box, Container, Typography } from '@mui/material'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { KanbanPreview } from './components/KanbanPreview'
import { FeatureGrid } from './components/FeatureGrid'

function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Hero />
        <Container maxWidth="lg" sx={{ mb: 10 }}>
          <KanbanPreview />
        </Container>
        <FeatureGrid />
      </Box>
      <Box component="footer" sx={{ py: 6, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} AsyncApex. Powered by AWS.
          </Typography>
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
