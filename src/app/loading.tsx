export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-emerald-500/10 dark:bg-emerald-500/20" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600 dark:border-emerald-400/30 dark:border-t-emerald-400" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Initializing Lead Gen SaaS
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading workspace components...
          </p>
        </div>
      </div>
    </div>
  );
}