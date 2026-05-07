import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../routes/navigation'

export function MobileNav() {
  return (
    <div className="border-b border-white/10 px-4 pb-4 lg:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {navigationItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-cyan-400/12 text-cyan-200'
                  : 'bg-white/[0.04] text-slate-300',
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
