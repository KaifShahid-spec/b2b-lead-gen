export function QuickActions() {
  return (
    <div className="flex items-center gap-3">
      <button type="button" className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
        Command palette
      </button>
      <button type="button" className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">
        New lead
      </button>
    </div>
  );
}
