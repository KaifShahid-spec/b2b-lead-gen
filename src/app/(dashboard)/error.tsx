"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard Shell Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-350 bg-white p-8 dark:border-slate-850 dark:bg-slate-950 transition-colors duration-200 shadow-sm text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Dashboard module error
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        The requested dashboard component failed to render. Try reloading to query Supabase records again.
      </p>
      {error.digest && (
        <span className="mt-2 rounded bg-slate-50 dark:bg-slate-900 px-2 py-1 text-xs font-mono text-slate-400 dark:text-slate-500">
          Code: {error.digest}
        </span>
      )}
      <Button
        type="button"
        onClick={reset}
        className="mt-6 gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
        Retry module
      </Button>
    </div>
  );
}