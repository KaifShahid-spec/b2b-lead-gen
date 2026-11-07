import { cn } from "@/lib/utils";
import type { LeadStatus, LeadPriority } from "@/types/lead";

// ─── Status Badge ─────────────────────────────────────────────
const STATUS_STYLES: Record<LeadStatus, string> = {
  new:          "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  contacted:    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  qualified:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  proposal:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  negotiation:  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  won:          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  lost:         "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  archived:     "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal", negotiation: "Negotiation", won: "Won",
  lost: "Lost", archived: "Archived",
};

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.new,
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────
const PRIORITY_STYLES: Record<LeadPriority, string> = {
  low:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high:   "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const PRIORITY_DOTS: Record<LeadPriority, string> = {
  low: "bg-slate-400", medium: "bg-blue-500", high: "bg-orange-500", urgent: "bg-red-500",
};

export function LeadPriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOTS[priority])} />
      {priority}
    </span>
  );
}

// ─── Score Bar ────────────────────────────────────────────────
export function LeadScoreBar({ score, className }: { score: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 80 ? "bg-emerald-500" :
    pct >= 60 ? "bg-sky-500" :
    pct >= 40 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{pct}</span>
    </div>
  );
}
