import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuickActions } from "@/app/(dashboard)/dashboard/components/QuickActions";
import { StatsCards } from "@/app/(dashboard)/dashboard/components/StatsCards";
import { LeadChart } from "@/app/(dashboard)/dashboard/components/LeadChart";
import { ActivityFeed } from "@/app/(dashboard)/dashboard/components/ActivityFeed";
import { RecentLeads } from "@/app/(dashboard)/dashboard/components/RecentLeads";
import { RecentCampaigns } from "@/app/(dashboard)/dashboard/components/RecentCampaigns";
import { getDashboardOverview } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  return (
    <main className="space-y-8">
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Dashboard" }]} />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700">
              {overview.workspaceName}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Dashboard home
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Monitor your lead flow, campaign activity, and workspace health from live database records.
            </p>
          </div>
          <QuickActions />
        </div>
      </div>

      <StatsCards metrics={overview.metrics} />

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <LeadChart data={overview.trend} />
        <ActivityFeed items={overview.activity} />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <RecentLeads leads={overview.recentLeads} />
        <RecentCampaigns campaigns={overview.recentCampaigns} />
      </div>
    </main>
  );
}
