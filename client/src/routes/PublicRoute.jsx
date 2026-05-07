import { Navigate, Outlet } from 'react-router-dom'
import { Loader } from '../components/ui/Loader'
import { useAuthStore } from '../store/auth.store'

export function PublicRoute() {
  const token = useAuthStore((state) => state.token)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

  if (isBootstrapping) {
    return <Loader label="Preparing your workspace..." />
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
