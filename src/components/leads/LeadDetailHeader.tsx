"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe,
  Linkedin,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Star,
  CalendarDays,
  Clock,
  Archive,
  RotateCcw,
  Pencil,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LeadStatusBadge,
  LeadPriorityBadge,
  LeadScoreBar,
} from "@/components/leads/LeadBadges";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  type LeadWithRelations,
  type LeadStatus,
  type LeadPriority,
} from "@/types/lead";

type Props = { lead: LeadWithRelations };

export function LeadDetailHeader({ lead }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const displayName =
    lead.contact_name ||
    lead.contact_email ||
    lead.company_name ||
    "Unnamed Lead";

  async function patch(body: Record<string, unknown>, label: string) {
    setLoading(label);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Lead updated");
      router.refresh();
    } catch {
      toast.error("Could not update lead");
    } finally {
      setLoading(null);
    }
  }

  async function handleArchive() {
    setLoading("archive");

    try {
      const res = await fetch(
        `/api/leads/${lead.id}?action=archive`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      toast.success("Lead archived");
      router.push("/leads");
    } catch {
      toast.error("Could not archive lead");
    } finally {
      setLoading(null);
    }
  }

  async function handleRestore() {
    setLoading("restore");

    try {
      const res = await fetch(
        `/api/leads/${lead.id}?action=restore`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      toast.success("Lead restored");
      router.refresh();
    } catch {
      toast.error("Could not restore lead");
    } finally {
      setLoading(null);
    }
  }

  const score = lead.ai_score ?? 0;

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: lead.contact_email,
      href: lead.contact_email ? `mailto:${lead.contact_email}` : null,
    },
    {
      icon: Phone,
      label: "Phone",
      value: lead.contact_phone,
      href: lead.contact_phone ? `tel:${lead.contact_phone}` : null,
    },
    {
      icon: Building2,
      label: "Company",
      value: lead.company_name,
      href: null,
    },
    {
      icon: Briefcase,
      label: "Title",
      value: lead.contact_title,
      href: null,
    },
    {
      icon: Globe,
      label: "Website",
      value: lead.company_website,
      href: lead.company_website,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: lead.contact_linkedin_url ? "Profile" : null,
      href: lead.contact_linkedin_url,
    },
    {
      icon: Star,
      label: "Source",
      value: lead.source?.replace(/_/g, " ") ?? null,
      href: null,
    },
    {
      icon: CalendarDays,
      label: "Created",
      value: format(new Date(lead.created_at), "MMM d, yyyy"),
      href: null,
    },
    {
      icon: Clock,
      label: "Last updated",
      value: formatDistanceToNow(new Date(lead.updated_at), {
        addSuffix: true,
      }),
      href: null,
    },
    ...(lead.last_contacted_at
      ? [
        {
          icon: CalendarDays,
          label: "Last contacted",
          value: formatDistanceToNow(
            new Date(lead.last_contacted_at),
            { addSuffix: true }
          ),
          href: null,
        },
      ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {displayName}
          </h1>

          {(lead.contact_title || lead.company_name) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {lead.contact_title}
              {lead.contact_title && lead.company_name ? ` @ ` : ""}
              {lead.company_name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href={`/leads/${lead.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>

          {lead.is_archived ? (
            <Button
              variant="outline"
              size="sm"
              disabled={loading === "restore"}
              onClick={handleRestore}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              {loading === "restore" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restore
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={loading === "archive"}
              onClick={handleArchive}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              {loading === "archive" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Quick-change chips */}
      <div className="flex flex-wrap gap-6">
        {/* Status */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Status
          </p>

          <div className="flex flex-wrap gap-1.5">
            {LEAD_STATUSES.filter((s) => s !== "archived").map((s) => (
              <button
                key={s}
                disabled={!!loading}
                onClick={() => patch({ status: s }, "status")}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all",
                  lead.status === s
                    ? "border-transparent ring-2 ring-offset-1 ring-slate-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                )}
              >
                <LeadStatusBadge status={s as LeadStatus} />
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Priority
          </p>

          <div className="flex flex-wrap gap-1.5">
            {LEAD_PRIORITIES.map((p) => (
              <button
                key={p}
                disabled={!!loading}
                onClick={() => patch({ priority: p }, "priority")}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all",
                  lead.priority === p
                    ? "border-transparent ring-2 ring-offset-1 ring-slate-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                )}
              >
                <LeadPriorityBadge priority={p as LeadPriority} />
              </button>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Score
          </p>

          <div className="flex items-center gap-3">
            <LeadScoreBar score={score} />

            <input
              type="range"
              min={0}
              max={100}
              defaultValue={score}
              className="w-24 accent-indigo-600"
              onMouseUp={(e) =>
                patch(
                  {
                    ai_score: Number(
                      (e.target as HTMLInputElement).value
                    ),
                  },
                  "score"
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Contact info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contactItems.map(({ icon: Icon, label, value, href }) =>
          value ? (
            <div
              key={label}
              className="flex items-start gap-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
            >
              <Icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {label}
                </p>

                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate capitalize">
                    {value}
                  </p>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}