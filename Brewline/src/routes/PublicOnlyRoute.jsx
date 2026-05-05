import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  if (!isHydrated) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicOnlyRoute
