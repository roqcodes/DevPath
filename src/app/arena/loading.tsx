export default function ArenaLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 pt-16 lg:px-8 lg:pt-8" role="status" aria-label="Loading the Arena">
      <div className="h-32 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6">
        <div className="h-2.5 w-20 rounded bg-cyan-300/40" />
        <div className="mt-3 h-6 w-72 max-w-full rounded bg-white/15" />
        <div className="mt-2 h-3 w-96 max-w-full rounded bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
            <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <span className="sr-only">Summoning the bosses…</span>
    </div>
  );
}
