import clsx from 'clsx'

const tones = {
  neutral: 'border-white/10 bg-white/6 text-slate-200',
  info: 'border-cyan-400/20 bg-cyan-400/12 text-cyan-200',
  success: 'border-emerald-400/20 bg-emerald-400/12 text-emerald-200',
  warning: 'border-amber-400/20 bg-amber-400/12 text-amber-200',
  danger: 'border-rose-400/20 bg-rose-400/12 text-rose-200',
}

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
