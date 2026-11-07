import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardActivityItem } from "@/lib/dashboard/queries";

const toneClasses: Record<DashboardActivityItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
};

export function ActivityFeed({ items }: { items: DashboardActivityItem[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Activity feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Badge className={toneClasses[item.tone]}>{item.label.slice(0, 2).toUpperCase()}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{item.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{item.time}</time>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">No recent activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
