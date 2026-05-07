import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AdminUserManager } from '../components/profile/AdminUserManager'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/auth.store'
import { formatDateTime } from '../utils/format'

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleRefreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    toast.success('Profile refreshed')
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Profile
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Account overview
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          This profile is hydrated from your authenticated backend session.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleRefreshProfile}>Refresh Profile</Button>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
          <p className="text-sm text-slate-400">Name</p>
          <p className="mt-3 text-lg font-semibold text-white">{user?.name ?? '-'}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
          <p className="text-sm text-slate-400">Email</p>
          <p className="mt-3 text-lg font-semibold text-white">{user?.email ?? '-'}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
          <p className="text-sm text-slate-400">Role</p>
          <p className="mt-3 text-lg font-semibold text-white">{user?.role ?? '-'}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
          <p className="text-sm text-slate-400">Created</p>
          <p className="mt-3 text-lg font-semibold text-white">
            {user?.createdAt ? formatDateTime(user.createdAt) : '-'}
          </p>
        </div>
      </div>

      {user?.role === 'ADMIN' && <AdminUserManager />}
    </section>
  )
}
