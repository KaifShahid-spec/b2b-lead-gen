import { requireWorkspace } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardRow = Record<string, unknown> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  name?: string;
  title?: string;
  company_name?: string;
  email?: string;
  score?: number | string;
};

export type DashboardTrendPoint = {
  date: string;
  leads: number;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardActivityItem = {
  id: string;
  label: string;
  description: string;
  time: string;
  tone: "emerald" | "sky" | "amber" | "slate";
};

export type DashboardOverview = {
  metrics: DashboardMetric[];
  trend: DashboardTrendPoint[];
  recentLeads: DashboardRow[];
  recentCampaigns: DashboardRow[];
  activity: DashboardActivityItem[];
  workspaceName: string;
};

function getDisplayName(row: DashboardRow, fallback: string) {
  return (
    (typeof row.name === "string" && row.name) ||
    (typeof row.title === "string" && row.title) ||
    (typeof row.company_name === "string" && row.company_name) ||
    (typeof row.email === "string" && row.email) ||
    fallback
  );
}

function getTimeValue(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function buildTrendData(rows: DashboardRow[], days = 14) {
  const today = new Date();
  const dayKeys = Array.from({ length: days }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (days - index - 1));
    return day.toISOString().slice(0, 10);
  });

  const counts = new Map(dayKeys.map((day) => [day, 0]));

  rows.forEach((row) => {
    const createdAt = getTimeValue(row.created_at);

    if (!createdAt) {
      return;
    }

    const key = createdAt.toISOString().slice(0, 10);

    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return dayKeys.map((date) => ({
    date: date.slice(5),
    leads: counts.get(date) ?? 0
  }));
}

function buildActivityItems(leads: DashboardRow[], campaigns: DashboardRow[]) {
  const leadItems = leads.slice(0, 5).map((lead, index) => ({
    id: lead.id ? `lead-${lead.id}` : `lead-${index}`,
    label: `${getDisplayName(lead, "Lead")}`,
    description: `New lead captured${lead.status ? ` • ${String(lead.status)}` : ""}`,
    time: lead.created_at ?? new Date().toISOString(),
    tone: "emerald" as const
  }));

  const campaignItems = campaigns.slice(0, 5).map((campaign, index) => ({
    id: campaign.id ? `campaign-${campaign.id}` : `campaign-${index}`,
    label: `${getDisplayName(campaign, "Campaign")}`,
    description: `Campaign status${campaign.status ? ` • ${String(campaign.status)}` : ""}`,
    time: campaign.updated_at ?? campaign.created_at ?? new Date().toISOString(),
    tone: "sky" as const
  }));

  return [...leadItems, ...campaignItems]
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 6)
    .map((item) => ({
      ...item,
      time: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(item.time))
    }));
}

function isActiveStatus(status?: string) {
  if (!status) {
    return true;
  }

  return !["closed", "archived", "won", "lost", "completed"].includes(status.toLowerCase());
}

function isQualifiedStatus(status?: string) {
  if (!status) {
    return false;
  }

  return ["qualified", "hot", "active", "open", "won"].includes(status.toLowerCase());
}

function getLeadScoreAverage(rows: DashboardRow[]) {
  const scores = rows
    .map((row) => Number(row.score))
    .filter((score) => Number.isFinite(score));

  if (!scores.length) {
    return 0;
  }

  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

export async function getDashboardOverview() {
  const workspace = await requireWorkspace();
  const teamId = workspace.team?.id;

  if (!teamId) {
    return {
      metrics: [],
      trend: [],
      recentLeads: [],
      recentCampaigns: [],
      activity: [],
      workspaceName: workspace.team?.name ?? "Workspace"
    } satisfies DashboardOverview;
  }

  const supabase = await createSupabaseServerClient();

  const [leadsResult, campaignsResult] = await Promise.all([
    supabase.from("leads").select("*").eq("team_id", teamId).order("created_at", { ascending: false }).limit(200),
    supabase.from("campaigns").select("*").eq("team_id", teamId).order("created_at", { ascending: false }).limit(200)
  ]);

  if (leadsResult.error) {
    throw leadsResult.error;
  }

  if (campaignsResult.error) {
    throw campaignsResult.error;
  }

  const leads = (leadsResult.data ?? []) as DashboardRow[];
  const campaigns = (campaignsResult.data ?? []) as DashboardRow[];
  const activeLeads = leads.filter((lead) => isActiveStatus(lead.status));
  const qualifiedLeads = leads.filter((lead) => isQualifiedStatus(lead.status));
  const activeCampaigns = campaigns.filter((campaign) => isActiveStatus(campaign.status));
  const trend = buildTrendData(leads);

  return {
    metrics: [
      {
        label: "Total leads",
        value: String(leads.length),
        detail: `${qualifiedLeads.length} qualified`
      },
      {
        label: "Active leads",
        value: String(activeLeads.length),
        detail: "Open and in-progress records"
      },
      {
        label: "Campaigns",
        value: String(campaigns.length),
        detail: `${activeCampaigns.length} active`
      },
      {
        label: "Avg. lead score",
        value: `${getLeadScoreAverage(leads)}`,
        detail: "From lead score values"
      }
    ],
    trend,
    recentLeads: leads.slice(0, 5),
    recentCampaigns: campaigns.slice(0, 5),
    activity: buildActivityItems(leads, campaigns),
    workspaceName: workspace.team?.name ?? "Workspace"
  };
}
