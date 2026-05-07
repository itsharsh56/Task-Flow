export function PagePlaceholder({ eyebrow, title, description, children }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          {eyebrow}
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          {description}
        </p>
      </div>

      {children ?? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            'API layer and auth bootstrap are connected.',
            'Routing and the app shell are production-ready.',
            'This page will receive live backend data in the next phase.',
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm leading-7 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
