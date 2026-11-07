import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardRow } from "@/lib/dashboard/queries";

function getLeadLabel(row: DashboardRow) {
  return (
    (typeof row.name === "string" && row.name) ||
    (typeof row.title === "string" && row.title) ||
    (typeof row.company_name === "string" && row.company_name) ||
    (typeof row.email === "string" && row.email) ||
    "Lead"
  );
}

export function RecentLeads({ leads }: { leads: DashboardRow[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent leads</CardTitle>
        <Link href="/leads" className="text-sm text-slate-600 hover:text-slate-950">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.length ? (
          leads.map((lead) => (
            <div key={String(lead.id ?? getLeadLabel(lead))} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{getLeadLabel(lead)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{typeof lead.status === "string" ? lead.status : "Unassigned"}</p>
              </div>
              <time className="text-xs text-slate-500 dark:text-slate-400">{lead.created_at ?? "Recently"}</time>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">No leads found in this workspace.</p>
        )}
      </CardContent>
    </Card>
  );
}
