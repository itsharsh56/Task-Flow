import clsx from 'clsx'

const variants = {
  primary:
    'bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus-visible:ring-cyan-300',
  secondary:
    'bg-white/8 text-white hover:bg-white/12 focus-visible:ring-white/30',
  ghost:
    'bg-transparent text-slate-300 hover:bg-white/8 hover:text-white focus-visible:ring-white/20',
}

export function Button({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
