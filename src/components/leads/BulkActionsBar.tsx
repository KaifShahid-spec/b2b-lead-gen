"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Archive, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  selectedIds: string[];
  archived: boolean;
  onSuccess: () => void;
  onClear: () => void;
};

export function BulkActionsBar({ selectedIds, archived, onSuccess, onClear }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const count = selectedIds.length;

  if (count === 0) return null;

  async function runBulk(action: string) {
    setLoading(action);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _bulk: true, action, ids: selectedIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      toast.success(`${data.count} lead${data.count !== 1 ? "s" : ""} ${action}d`);
      onSuccess();
      onClear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5",
        "dark:border-indigo-800 dark:bg-indigo-950/40 animate-in slide-in-from-top-2 duration-200"
      )}
    >
      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
        {count} selected
      </span>

      <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-700" />

      {!archived && (
        <Button
          variant="ghost"
          size="sm"
          disabled={!!loading}
          onClick={() => runBulk("archive")}
          className="text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
        >
          {loading === "archive" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          Archive
        </Button>
      )}

      {archived && (
        <Button
          variant="ghost"
          size="sm"
          disabled={!!loading}
          onClick={() => runBulk("restore")}
          className="text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
        >
          {loading === "restore" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Restore
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={!!loading}
        onClick={() => runBulk("delete")}
        className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
      >
        {loading === "delete" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="ml-auto text-slate-500"
      >
        Deselect
      </Button>
    </div>
  );
}
