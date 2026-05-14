import './App.css'
import { AppThemeProvider } from './theme/AppThemeProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { RoleSelection } from './pages/RoleSelection'
import { SignUp } from './pages/SignUp'
import { Login } from './pages/Login'
import { MainDashboard } from './pages/MainDashboard'
import { Projects } from './pages/Projects'
import { Teams } from './pages/Teams'
import { NewProject } from './pages/NewProject'
import { Management } from './pages/Management'

function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/management" element={<Management />} />
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  )
}

export default App
