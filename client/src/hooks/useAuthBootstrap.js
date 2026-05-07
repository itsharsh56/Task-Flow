import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/auth/auth.service'
import { useAuthStore } from '../store/auth.store'

export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const logout = useAuthStore((state) => state.logout)

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authService.getProfile,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!token) {
      finishBootstrap()
    }
  }, [token, finishBootstrap])

  useEffect(() => {
    if (profileQuery.isSuccess) {
      setUser(profileQuery.data.data)
    }
  }, [profileQuery.isSuccess, profileQuery.data, setUser])

  useEffect(() => {
    if (profileQuery.isError) {
      logout()
    }
  }, [profileQuery.isError, logout])
}
