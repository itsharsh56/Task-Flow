import clsx from 'clsx'
import { TaskFlowLogo } from '../common/TaskFlowLogo'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../routes/navigation'
import { useAuthStore } from '../../store/auth.store'

export function Sidebar() {
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-slate-950/80 px-6 py-6 backdrop-blur lg:flex lg:flex-col">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl shadow-[0_10px_30px_rgba(34,211,238,0.2)]">
            <TaskFlowLogo className="h-14 w-14" />
          </div>


          <div>
            <p className="text-[1.4rem] font-semibold tracking-tight text-white">TaskFlow</p>
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/70">
              Team Operations
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="text-sm font-medium text-white">
            {user?.name ?? 'Workspace User'}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-cyan-300/80">
            {user?.role ?? 'Member'}
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {navigationItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-cyan-400/12 text-cyan-200'
                  : 'text-slate-300 hover:bg-white/6 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/8 p-5">
        <p className="text-sm font-semibold text-white">Foundation Complete</p>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Auth, routing, persistence, and the app shell are ready for live feature pages.
        </p>
      </div>
    </aside>
  )
}
