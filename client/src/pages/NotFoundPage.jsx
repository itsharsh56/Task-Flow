import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          404
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          This page took a wrong turn
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          The route does not exist or may have been moved while the workspace is still being built.
        </p>

        <div className="mt-8 flex justify-center">
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
