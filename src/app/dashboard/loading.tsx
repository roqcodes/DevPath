import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50/60" role="status" aria-label="Loading your day">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
        <div className="h-56 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 motion-safe:animate-pulse lg:h-64" />
        <Skeleton className="-mt-14 mx-6 h-24 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[118px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Loading your day…</span>
    </div>
  );
}
