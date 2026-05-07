export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
