import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/auth";
import { Megaphone, Plus, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Campaigns | B2B Lead Gen",
  description: "Manage your outreach campaigns.",
};

type CampaignRow = {
  id: string;
  name: string;
  status: string | null;
  total_leads: number | null;
  contacted_count: number | null;
  response_count: number | null;
  created_at: string | null;
};

function statusClasses(status: string | null) {
  const s = (status ?? "draft").toLowerCase();
  if (s === "active")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (s === "paused")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (s === "completed")
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
  if (s === "archived")
    return "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function CampaignsPage() {
  const workspace = await requireWorkspace();
  const teamId = workspace.team?.id;

  if (!teamId) {
    return (
      <main className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Campaigns" },
          ]}
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No team found for this workspace.
          </CardContent>
        </Card>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "id, name, status, total_leads, contacted_count, response_count, created_at"
    )
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const campaigns = (data ?? []) as CampaignRow[];

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Campaigns" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
              Campaigns
              <span className="ml-2 text-base font-normal text-slate-400 dark:text-slate-500">
                ({campaigns.length})
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All outreach campaigns in your workspace.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Megaphone className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No campaigns yet. Create your first one to start outreach.
            </p>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="h-4 w-4" />
                Create campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>All campaigns</CardTitle>
            <CardDescription>
              Click a campaign to view details and enrolled leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Leads
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      Contacted
                    </th>
                    <th className="px-6 py-3 font-medium text-right">
                      Responses
                    </th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="font-medium text-slate-950 hover:text-indigo-600 dark:text-slate-50 dark:hover:text-indigo-400"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClasses(
                            c.status
                          )}`}
                        >
                          {c.status ?? "draft"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">
                        {c.total_leads ?? 0}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">
                        {c.contacted_count ?? 0}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">
                        {c.response_count ?? 0}
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}