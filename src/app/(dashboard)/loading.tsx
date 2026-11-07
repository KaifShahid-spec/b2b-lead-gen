export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumbs & Title Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-850" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-24 rounded-md bg-emerald-100 dark:bg-emerald-950/40" />
            <div className="h-8 w-48 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-96 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-32 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Metrics Cards Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-3">
            <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Middle Section (Charts & Activities) */}
      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        {/* Lead Chart Skeleton */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-64 rounded bg-slate-100 dark:bg-slate-900/60" />
        </div>
        
        {/* Activity Feed Skeleton */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}