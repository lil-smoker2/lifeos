import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './features/auth/AuthProvider'
import { ThemeProvider } from './features/theme/ThemeProvider'
import { AppShell } from './layouts/AppShell'
import { AuthLayout } from './layouts/AuthLayout'
import './App.css'

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const TasksPage = lazy(() => import('./pages/TasksPage').then(module => ({ default: module.TasksPage })))
const PlannerPage = lazy(() => import('./pages/PlannerPage').then(module => ({ default: module.PlannerPage })))
const LearningPage = lazy(() => import('./pages/LearningPage').then(module => ({ default: module.LearningPage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then(module => ({ default: module.FinancePage })))
const HealthPage = lazy(() => import('./pages/HealthPage').then(module => ({ default: module.HealthPage })))
const NotesPage = lazy(() => import('./pages/NotesPage').then(module => ({ default: module.NotesPage })))
const FilesPage = lazy(() => import('./pages/FilesPage').then(module => ({ default: module.FilesPage })))
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(module => ({ default: module.GoalsPage })))
const AiPage = lazy(() => import('./pages/AiPage').then(module => ({ default: module.AiPage })))
const AutomationPage = lazy(() => import('./pages/AutomationPage').then(module => ({ default: module.AutomationPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const HelpPage = lazy(() => import('./pages/HelpPage').then(module => ({ default: module.HelpPage })))
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(module => ({ default: module.AlertsPage })))
const WelcomePage = lazy(() => import('./pages/WelcomePage').then(module => ({ default: module.WelcomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="boot-screen" role="status">Loading LifeOS...</div>}>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="welcome" element={<WelcomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>

                <Route element={<RequireAuth />}>
                  <Route element={<AppShell />}>
                    <Route index element={<Dashboard />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="planner" element={<PlannerPage />} />
                    <Route path="learning" element={<LearningPage />} />
                    <Route path="finance" element={<FinancePage />} />
                    <Route path="health" element={<HealthPage />} />
                    <Route path="notes" element={<NotesPage />} />
                    <Route path="files" element={<FilesPage />} />
                    <Route path="goals" element={<GoalsPage />} />
                    <Route path="ai" element={<AiPage />} />
                    <Route path="automation" element={<AutomationPage />} />
                    <Route path="notifications" element={<AlertsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="help" element={<HelpPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/welcome" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
