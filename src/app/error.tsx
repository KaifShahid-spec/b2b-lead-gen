"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Root Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 transition-colors duration-200">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            An unexpected error occurred
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            We apologize for the inconvenience. The application encountered a crash. You can try to reload the current route.
          </p>
          {error.digest && (
            <div className="mt-4 rounded bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">
              ID: {error.digest}
            </div>
          )}
          <div className="mt-8 flex w-full flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={reset}
              className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="flex-1 gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}