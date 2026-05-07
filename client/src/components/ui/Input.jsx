import clsx from 'clsx'
import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <label className="block space-y-2">
      {label && (
        <span className="text-sm font-medium text-slate-200">{label}</span>
      )}

      <input
        ref={ref}
        className={clsx(
          'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10',
          error && 'border-rose-400/50 focus:border-rose-400/50 focus:ring-rose-400/10',
          className,
        )}
        {...props}
      />

      {error && <p className="text-sm text-rose-300">{error}</p>}
    </label>
  )
})
