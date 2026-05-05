import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthPage from './pages/AuthPage'
import AlertsPage from './pages/AlertsPage'
import ChatPage from './pages/ChatPage'
import ChatroomsPage from './pages/ChatroomsPage'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

function App() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/chatrooms" element={<ChatroomsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat/:symbol" element={<ChatPage />} />
      </Route>
      <Route
        path="/auth/:mode"
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
