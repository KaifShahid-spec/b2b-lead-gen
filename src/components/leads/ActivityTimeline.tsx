import { getLeadActivities } from "@/lib/leads/queries";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  SlidersHorizontal,
  FileText,
  Tag,
  Archive,
  RotateCcw,
  Circle,
} from "lucide-react";
import type { LeadActivity } from "@/types/lead";

const ACTION_CONFIG: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  created: {
    label: "Lead created",
    Icon: Plus,
    color: "bg-emerald-500",
  },
  status_changed: {
    label: "Status changed",
    Icon: SlidersHorizontal,
    color: "bg-sky-500",
  },
  priority_changed: {
    label: "Priority changed",
    Icon: SlidersHorizontal,
    color: "bg-amber-500",
  },
  note_added: {
    label: "Note added",
    Icon: FileText,
    color: "bg-violet-500",
  },
  tag_added: {
    label: "Tag added",
    Icon: Tag,
    color: "bg-indigo-500",
  },
  tags_updated: {
    label: "Tags updated",
    Icon: Tag,
    color: "bg-indigo-500",
  },
  archived: {
    label: "Lead archived",
    Icon: Archive,
    color: "bg-slate-400",
  },
  restored: {
    label: "Lead restored",
    Icon: RotateCcw,
    color: "bg-emerald-500",
  },
};

function getConfig(activityType: string) {
  return (
    ACTION_CONFIG[activityType] ?? {
      label: activityType || "Activity",
      Icon: Circle,
      color: "bg-slate-400",
    }
  );
}

function buildDescription(activity: LeadActivity): string {
  const metadata = activity.metadata ?? {};
  const activityType = activity.activity_type;

  if (activityType === "status_changed") {
    return `${String(metadata.from ?? "")} → ${String(metadata.to ?? "")}`;
  }

  if (activityType === "priority_changed") {
    return `${String(metadata.from ?? "")} → ${String(metadata.to ?? "")}`;
  }

  if (activityType === "note_added" && metadata.preview) {
    return `"${String(metadata.preview)}…"`;
  }

  return "";
}

export async function ActivityTimeline({
  leadId,
}: {
  leadId: string;
}) {
  const activities = await getLeadActivities(leadId);

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 space-y-0">
      {activities.map((activity) => {
        const { label, Icon, color } = getConfig(
          activity.activity_type ?? ""
        );

        const desc = buildDescription(activity);

        const actorName = activity.user_id
          ? "User"
          : "System";

        return (
          <li
            key={activity.id}
            className="relative pl-6 pb-5 last:pb-0"
          >
            <span
              className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${color} flex items-center justify-center ring-2 ring-white dark:ring-slate-900`}
            >
              <Icon className="h-2.5 w-2.5 text-white" />
            </span>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {label}
                </p>

                {desc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {desc}
                  </p>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  by {actorName}
                </p>
              </div>

              <time className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}