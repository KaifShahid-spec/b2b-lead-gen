"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCampaignStatus } from "./actions";
import { EditCampaignDialog } from "./EditCampaignDialog";
import {
    CAMPAIGN_STATUSES,
    type Campaign,
    type CampaignStatus,
} from "@/lib/campaigns/constants";

type Props = { campaign: Campaign };

const STATUS_STYLES: Record<CampaignStatus, string> = {
    draft:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    active:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    paused:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    completed:
        "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    archived:
        "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function CampaignHeader({ campaign }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<string>(campaign.status ?? "draft");
    const [editing, setEditing] = useState(false);

    function handleStatusChange(next: CampaignStatus) {
        if (next === status) return;
        setStatus(next);
        startTransition(async () => {
            const result = await updateCampaignStatus(campaign.id, next);
            if (result.ok) {
                toast.success("Campaign status updated");
                router.refresh();
            } else {
                setStatus(campaign.status ?? "draft");
                toast.error(result.error);
            }
        });
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                            {campaign.name}
                        </h1>
                        {campaign.description && (
                            <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
                                {campaign.description}
                            </p>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {CAMPAIGN_STATUSES.map((s) => (
                            <Button
                                key={s}
                                variant="outline"
                                size="sm"
                                disabled={isPending}
                                onClick={() => handleStatusChange(s)}
                                className={cn(
                                    "h-7 rounded-full border-transparent px-3 text-xs capitalize",
                                    status === s
                                        ? STATUS_STYLES[s] + " ring-2 ring-offset-1 ring-slate-400"
                                        : "bg-white dark:bg-slate-900"
                                )}
                            >
                                {isPending && status === s ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    s
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {editing && (
                <EditCampaignDialog
                    campaign={campaign}
                    onClose={() => setEditing(false)}
                />
            )}
        </>
    );
}