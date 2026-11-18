import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './features/theme/ThemeProvider'
import { AppShell } from './layouts/AppShell'
import { Dashboard } from './pages/Dashboard'
import { TasksPage } from './pages/TasksPage'
import { PlannerPage } from './pages/PlannerPage'
import { LearningPage } from './pages/LearningPage'
import { FinancePage } from './pages/FinancePage'
import { HealthPage } from './pages/HealthPage'
import { NotesPage } from './pages/NotesPage'
import { FilesPage } from './pages/FilesPage'
import { GoalsPage } from './pages/GoalsPage'
import { AiPage } from './pages/AiPage'
import { AutomationPage } from './pages/AutomationPage'
import { SettingsPage } from './pages/SettingsPage'
import { HelpPage } from './pages/HelpPage'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
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
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
