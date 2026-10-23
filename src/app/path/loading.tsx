export default function PathLoading() {
  return (
    <div className="mx-auto max-w-md space-y-6 py-8 animate-pulse" aria-busy="true" aria-label="Loading path">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-16 w-[58%] rounded-2xl bg-slate-100 ${i % 2 === 0 ? "mr-auto" : "ml-auto"}`}
          />
        ))}
      </div>
    </div>
  );
}
