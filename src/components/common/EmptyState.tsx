import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
      {icon}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
