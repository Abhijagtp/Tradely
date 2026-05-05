import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const location = useLocation()

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
