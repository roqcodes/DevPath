export default function WrappedLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 pt-16 lg:px-8 lg:pt-8" role="status" aria-label="Loading your recap">
      <div className="space-y-2">
        <div className="h-2.5 w-24 rounded bg-indigo-100" />
        <div className="h-5 w-64 rounded bg-slate-200" />
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-950 to-slate-950">
        <div className="absolute inset-x-4 top-4 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white/20" />
          ))}
        </div>
        <div className="absolute bottom-10 left-7 right-7 space-y-3">
          <div className="h-2.5 w-24 rounded bg-cyan-300/40" />
          <div className="h-9 w-56 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
          <div className="h-9 w-40 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">Wrapping up your progress…</span>
    </div>
  );
}
