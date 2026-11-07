"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from "@/types/lead";

const ALL = "all";

export function LeadFilters({ archived = false }: { archived?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: string) => searchParams.get(key) ?? "";

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === ALL) params.delete(k);
        else params.set(k, v);
      });
      // Reset page on filter change
      if (!("page" in updates)) params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams]
  );

  const hasFilters = get("search") || get("status") || get("priority") || get("source");

  function clearAll() {
    startTransition(() => router.replace(pathname));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3",
        "dark:border-slate-700 dark:bg-slate-900",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          defaultValue={get("search")}
          placeholder="Search leads…"
          className="pl-9"
          onChange={(e) => push({ search: e.target.value })}
        />
      </div>

      {/* Status */}
      <FilterSelect
        value={get("status") || ALL}
        onChange={(v) => push({ status: v })}
        label="Status"
      >
        <option value={ALL}>All statuses</option>
        {LEAD_STATUSES.filter((s) => s !== "archived").map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </FilterSelect>

      {/* Priority */}
      <FilterSelect
        value={get("priority") || ALL}
        onChange={(v) => push({ priority: v })}
        label="Priority"
      >
        <option value={ALL}>All priorities</option>
        {LEAD_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </FilterSelect>

      {/* Source */}
      <FilterSelect
        value={get("source") || ALL}
        onChange={(v) => push({ source: v })}
        label="Source"
      >
        <option value={ALL}>All sources</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </FilterSelect>

      {/* Archive toggle */}
      <Button
        variant={archived ? "default" : "outline"}
        size="sm"
        onClick={() => push({ archived: archived ? "" : "true" })}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {archived ? "Active" : "Archived"}
      </Button>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
        "dark:focus-visible:ring-slate-300"
      )}
    >
      {children}
    </select>
  );
}
