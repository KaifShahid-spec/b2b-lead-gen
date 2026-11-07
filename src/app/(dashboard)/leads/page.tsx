import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { ImportExportPanel } from "@/components/leads/ImportExportPanel";
import { getLeads } from "@/lib/leads/queries";
import { Plus, Users } from "lucide-react";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadsQueryParams,
  type LeadStatus,
  type LeadPriority,
  type LeadSource,
} from "@/types/lead";

type SearchParams = {
  page?: string;
  pageSize?: string;
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  sortBy?: string;
  sortDir?: string;
  archived?: string;
  tags?: string;
};

const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "contact_name",
  "contact_email",
  "company_name",
  "contact_title",
  "status",
  "priority",
  "ai_score",
  "last_contacted_at",
  "next_follow_up_at",
  "engagement_score",
] as const;

type SortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  max: number
): number {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function parseEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[]
): T | undefined {
  if (!value) return undefined;

  return allowed.includes(value as T)
    ? (value as T)
    : undefined;
}

function parseSortColumn(value: string | undefined): SortColumn {
  if (!value) return "created_at";

  return ALLOWED_SORT_COLUMNS.includes(value as SortColumn)
    ? (value as SortColumn)
    : "created_at";
}

function parseSortDirection(
  value: string | undefined
): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function parseTags(
  value: string | undefined
): string[] | undefined {
  if (!value) return undefined;

  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length > 0 ? tags : undefined;
}

export const metadata = {
  title: "Leads | B2B Lead Gen",
  description: "Manage all your B2B leads in one place.",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const archived = sp.archived === "true";

  const params: LeadsQueryParams = {
    page: parsePositiveInt(sp.page, 1, 100000),
    pageSize: parsePositiveInt(sp.pageSize, 25, 100),
    search: sp.search?.trim() || undefined,
    status: parseEnum<LeadStatus>(
      sp.status,
      LEAD_STATUSES
    ),
    priority: parseEnum<LeadPriority>(
      sp.priority,
      LEAD_PRIORITIES
    ),
    source: parseEnum<LeadSource>(
      sp.source,
      LEAD_SOURCES
    ),
    sortBy: parseSortColumn(sp.sortBy),
    sortDir: parseSortDirection(sp.sortDir),
    archived,
    tags: parseTags(sp.tags),
  };

  const data = await getLeads(params);

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Leads

              <span className="ml-2 text-base font-normal text-slate-400 dark:text-slate-500">
                ({data.count})
              </span>
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {archived
                ? "Archived leads"
                : "All active leads from your workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ImportExportPanel archived={archived} />

          <Button asChild>
            <Link href="/leads/new">
              <Plus className="h-4 w-4" />
              Add lead
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={null}>
        <LeadFilters archived={archived} />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-pulse" />
        }
      >
        <LeadTable
          initialData={data}
          archived={archived}
        />
      </Suspense>
    </main>
  );
}