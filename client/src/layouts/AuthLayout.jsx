import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_right,rgba(14,165,233,0.16),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            TaskFlow
          </p>

          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
            Project execution that feels as sharp as the best SaaS products.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Bring projects, tasks, deadlines, and team activity into one calm,
            structured workspace built for fast-moving teams.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              'JWT auth with persistent sessions',
              'Protected workspace routing',
              'Responsive app shell ready for scale',
              'Backend-ready API layer and state management',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/78 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
