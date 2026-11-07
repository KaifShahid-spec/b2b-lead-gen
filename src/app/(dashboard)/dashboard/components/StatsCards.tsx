import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/dashboard/queries";

export function StatsCards({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{metric.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
