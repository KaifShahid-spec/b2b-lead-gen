import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Mail,
  MessageSquare,
  TrendingUp,
  Target,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
} from "lucide-react";
import {
  getCampaignById,
  getCampaignLeads,
  getAvailableLeadsForCampaign,
} from "@/lib/campaigns/queries";
import { CampaignHeader } from "./CampaignHeader";
import { CampaignLeadsSection } from "./CampaignLeadsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignById(id).catch(() => null);
  return { title: campaign ? `${campaign.name} | Campaigns` : "Campaign" };
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

function safeArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

function pct(numerator: number | null, denominator: number | null) {
  const n = numerator ?? 0;
  const d = denominator ?? 0;
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export default async function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const campaignLeads = await getCampaignLeads(campaign.id).catch(() => []);
  const availableLeads = await getAvailableLeadsForCampaign(campaign.id).catch(
    () => []
  );

  const industries = safeArray(campaign.target_industries);
  const locations = safeArray(campaign.target_locations);
  const sizes = safeArray(campaign.target_company_sizes);
  const titles = safeArray(campaign.target_job_titles);

  const metrics = [
    {
      label: "Total leads",
      value: campaign.total_leads ?? campaignLeads.length,
      icon: Users,
      tone: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40",
    },
    {
      label: "Contacted",
      value: campaign.contacted_count ?? 0,
      detail: `${pct(campaign.contacted_count, campaign.total_leads)} of total`,
      icon: Mail,
      tone: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40",
    },
    {
      label: "Responses",
      value: campaign.response_count ?? 0,
      detail: `${pct(campaign.response_count, campaign.contacted_count)} reply rate`,
      icon: MessageSquare,
      tone: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40",
    },
    {
      label: "Conversions",
      value: campaign.conversion_count ?? 0,
      detail: `${pct(campaign.conversion_count, campaign.response_count)} conv. rate`,
      icon: TrendingUp,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40",
    },
  ];

  const targetGroups = [
    { label: "Industries", items: industries, icon: Building2 },
    { label: "Locations", items: locations, icon: MapPin },
    { label: "Company sizes", items: sizes, icon: Target },
    { label: "Job titles", items: titles, icon: Briefcase },
  ].filter((g) => g.items.length > 0);

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Campaigns", href: "/campaigns" },
          { label: campaign.name },
        ]}
      />

      <CampaignHeader campaign={campaign} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <Card key={label} className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-start gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  {value}
                </p>
                {detail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {detail}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
            <CardDescription>Who this campaign is sent to.</CardDescription>
          </CardHeader>
          <CardContent>
            {targetGroups.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No targeting rules set. Click Edit to add industries, locations,
                sizes, or titles.
              </p>
            ) : (
              <div className="space-y-4">
                {targetGroups.map(({ label, items, icon: Icon }) => (
                  <div key={label}>
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>When this campaign runs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Start</span>
              <span className="text-slate-950 dark:text-slate-50">
                {formatDate(campaign.start_date)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">End</span>
              <span className="text-slate-950 dark:text-slate-50">
                {formatDate(campaign.end_date)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Timezone</span>
              <span className="text-slate-950 dark:text-slate-50">
                {campaign.timezone ?? "UTC"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                AI personalization
              </span>
              <span
                className={
                  campaign.ai_personalization
                    ? "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }
              >
                {campaign.ai_personalization && (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {campaign.ai_personalization ? "On" : "Off"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Type</span>
              <span className="capitalize text-slate-950 dark:text-slate-50">
                {campaign.type ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CampaignLeadsSection
        campaignId={campaign.id}
        campaignName={campaign.name}
        campaignLeads={campaignLeads}
        availableLeads={availableLeads}
      />

      <div className="text-sm">
        <Link
          href="/campaigns"
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← All campaigns
        </Link>
      </div>
    </main>
  );
}