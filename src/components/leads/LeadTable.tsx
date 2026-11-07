"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ArrowLeft,
  ArrowRight,
  Archive,
  RotateCcw,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkActionsBar } from "@/components/leads/BulkActionsBar";
import {
  LeadStatusBadge,
  LeadPriorityBadge,
  LeadScoreBar,
} from "@/components/leads/LeadBadges";
import { cn } from "@/lib/utils";
import type { Lead, LeadsPaginatedResult } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";

type Props = {
  initialData: LeadsPaginatedResult;
  archived: boolean;
};

type SortState = {
  col: string;
  dir: "asc" | "desc";
};

export function LeadTable({ initialData, archived }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [data, setData] = useState<LeadsPaginatedResult>(initialData);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [sort, setSort] = useState<SortState>({
    col: searchParams.get("sortBy") ?? "created_at",
    dir: (searchParams.get("sortDir") as "asc" | "desc") ?? "desc",
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  function toggleSort(col: string) {
    const next: SortState =
      sort.col === col
        ? {
          col,
          dir: sort.dir === "asc" ? "desc" : "asc",
        }
        : {
          col,
          dir: "asc",
        };

    setSort(next);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", next.col);
    params.set("sortDir", next.dir);
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function goPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  const allIds = data.data.map((lead) => lead.id);

  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function quickAction(
    id: string,
    action: "archive" | "restore" | "delete"
  ) {
    setActionLoading(id + action);

    try {
      const res = await fetch(`/api/leads/${id}?action=${action}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Action failed");
      }

      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      const actionLabel =
        action === "archive"
          ? "archived"
          : action === "restore"
            ? "restored"
            : "deleted";

      toast.success(`Lead ${actionLabel} successfully`);

      router.refresh();
    } catch {
      toast.error(`Failed to ${action} lead`);
    } finally {
      setActionLoading(null);
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sort.col !== col) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />;
    }

    return sort.dir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
    );
  };

  const Th = ({
    col,
    label,
    sortable = true,
    className,
  }: {
    col: string;
    label: string;
    sortable?: boolean;
    className?: string;
  }) => (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
        sortable &&
        "cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200",
        className
      )}
      onClick={sortable ? () => toggleSort(col) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && <SortIcon col={col} />}
      </span>
    </th>
  );

  if (data.data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {archived
            ? "No archived leads."
            : "No leads found. Try adjusting your filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BulkActionsBar
        selectedIds={[...selected]}
        archived={archived}
        onSuccess={() => router.refresh()}
        onClear={() => setSelected(new Set())}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
                />
              </th>

              <Th col="contact_name" label="Name" />
              <Th col="company_name" label="Company" />
              <Th col="status" label="Status" />
              <Th col="priority" label="Priority" />
              <Th col="ai_score" label="Score" />
              <Th col="source" label="Source" />
              <Th col="created_at" label="Created" />

              <th scope="col" className="w-24 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.data.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                selected={selected.has(lead.id)}
                onToggle={() => toggleOne(lead.id)}
                archived={archived}
                actionLoading={actionLoading}
                onAction={quickAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {(data.page - 1) * data.pageSize + 1}–
          {Math.min(data.page * data.pageSize, data.count)} of {data.count}{" "}
          leads
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data.page <= 1}
            onClick={() => goPage(data.page - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Prev
          </Button>

          <span className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
            {data.page} / {data.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={data.page >= data.totalPages}
            onClick={() => goPage(data.page + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  selected,
  onToggle,
  archived,
  actionLoading,
  onAction,
}: {
  lead: Lead;
  selected: boolean;
  onToggle: () => void;
  archived: boolean;
  actionLoading: string | null;
  onAction: (
    id: string,
    action: "archive" | "restore" | "delete"
  ) => void;
}) {
  const displayName =
    lead.contact_name ||
    lead.contact_email ||
    lead.company_name ||
    "Unnamed";

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
        selected && "bg-indigo-50/50 dark:bg-indigo-950/30"
      )}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          aria-label={`Select ${displayName}`}
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-slate-600"
        />
      </td>

      <td className="px-4 py-3">
        <Link href={`/leads/${lead.id}`} className="group/link block">
          <p className="font-medium text-slate-900 transition-colors group-hover/link:text-indigo-600 dark:text-slate-50 dark:group-hover/link:text-indigo-400">
            {displayName}
          </p>

          {lead.contact_email && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {lead.contact_email}
            </p>
          )}
        </Link>
      </td>

      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
        {lead.company_name || (
          <span className="text-slate-400">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        <LeadStatusBadge status={lead.status} />
      </td>

      <td className="px-4 py-3">
        <LeadPriorityBadge priority={lead.priority} />
      </td>

      <td className="px-4 py-3">
        <LeadScoreBar score={lead.ai_score ?? 0} />
      </td>

      <td className="px-4 py-3 text-xs capitalize text-slate-500 dark:text-slate-400">
        {lead.source?.replace(/_/g, " ") ?? "—"}
      </td>

      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {formatDistanceToNow(new Date(lead.created_at), {
          addSuffix: true,
        })}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link href={`/leads/${lead.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {!archived ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-500 hover:text-amber-600"
              title="Archive"
              disabled={actionLoading === lead.id + "archive"}
              onClick={() => onAction(lead.id, "archive")}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-500 hover:text-emerald-600"
              title="Restore"
              disabled={actionLoading === lead.id + "restore"}
              onClick={() => onAction(lead.id, "restore")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-600"
            title="Delete"
            disabled={actionLoading === lead.id + "delete"}
            onClick={() => onAction(lead.id, "delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}