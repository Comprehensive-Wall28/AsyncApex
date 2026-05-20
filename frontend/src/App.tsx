import './App.css';
import { AppThemeProvider } from './theme/AppThemeProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Landing } from './pages/Landing';
import { RoleSelection } from './pages/RoleSelection';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { MainDashboard } from './pages/MainDashboard';
import { Projects } from './pages/Projects';
import { Teams } from './pages/Teams';
import { Management } from './pages/Management';
import { Tasks } from './pages/Tasks';
import { NewProject } from './pages/NewProject';
import { DashboardLayout } from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerRoute from './components/ManagerRoute';
import { NotFound } from './components/NotFound';
import { Documentation } from './pages/Documentation';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <AppThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/features" element={<Features />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/Pricing" element={<Pricing />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<MainDashboard />} />
              <Route path="/projects" element={<ManagerRoute><Projects /></ManagerRoute>} />
              <Route path="/projects/new" element={<ManagerRoute><NewProject /></ManagerRoute>} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/management" element={<Management />} />
            </Route>
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </>
  );
}

export default App;