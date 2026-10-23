export default function ReviewLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-4 py-8 animate-pulse" aria-busy="true" aria-label="Loading review">
      <div className="h-8 w-40 rounded-lg bg-slate-200" />
      <div className="h-2 w-full rounded-full bg-slate-100" />
      <div className="h-48 rounded-2xl bg-slate-100" />
    </div>
  );
}
