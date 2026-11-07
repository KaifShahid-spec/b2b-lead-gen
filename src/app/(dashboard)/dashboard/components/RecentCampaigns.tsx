import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardRow } from "@/lib/dashboard/queries";

function getCampaignLabel(row: DashboardRow) {
  return (
    (typeof row.name === "string" && row.name) ||
    (typeof row.title === "string" && row.title) ||
    "Campaign"
  );
}

export function RecentCampaigns({ campaigns }: { campaigns: DashboardRow[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent campaigns</CardTitle>
        <Link href="/campaigns" className="text-sm text-slate-600 hover:text-slate-950">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.length ? (
          campaigns.map((campaign) => (
            <div key={String(campaign.id ?? getCampaignLabel(campaign))} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-slate-50">{getCampaignLabel(campaign)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{campaign.updated_at ?? campaign.created_at ?? "Recently"}</p>
              </div>
              <Badge variant="secondary">{typeof campaign.status === "string" ? campaign.status : "Draft"}</Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">No campaigns found in this workspace.</p>
        )}
      </CardContent>
    </Card>
  );
}
