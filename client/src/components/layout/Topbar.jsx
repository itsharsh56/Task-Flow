import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut, Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notificationsService } from '../../services/notifications/notifications.service'
import { useAuthStore } from '../../store/auth.store'
import { Button } from '../ui/Button'

function getPageTitle(pathname) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/projects/')) return 'Project Details'
  if (pathname.startsWith('/projects')) return 'Projects'
  if (pathname.startsWith('/board')) return 'Kanban Board'
  if (pathname.startsWith('/tasks/')) return 'Task Details'
  if (pathname.startsWith('/my-tasks')) return 'My Tasks'
  if (pathname.startsWith('/notifications')) return 'Notifications'
  if (pathname.startsWith('/profile')) return 'Profile'
  return 'TaskFlow'
}

export function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'summary'],
    queryFn: () => notificationsService.getNotifications({ page: 1, limit: 1 }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const unreadCount = notificationsQuery.data?.data?.meta?.unreadCount ?? 0

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {getPageTitle(location.pathname)}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <span>Search projects, tasks, and activity</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <Bell className="h-4 w-4 text-cyan-300" />
            <span>{unreadCount} unread</span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-sm font-semibold text-cyan-200">
              {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name ?? 'User'}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {user?.role ?? 'Member'}
              </p>
            </div>
          </div>

          <Button variant="ghost" onClick={handleLogout} className="px-4">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
