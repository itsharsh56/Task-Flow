import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '../components/ui/Loader'
import { useAuthStore } from '../store/auth.store'

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)
  const location = useLocation()

  if (isBootstrapping) {
    return <Loader label="Checking your session..." />
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
