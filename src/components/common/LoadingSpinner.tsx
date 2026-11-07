import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export function LoadingSpinner({ className, label = "Loading...", ...props }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-slate-600", className)} {...props}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <span>{label}</span>
    </div>
  );
}
