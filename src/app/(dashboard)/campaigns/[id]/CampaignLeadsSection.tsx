"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import type { AvailableLead } from "@/lib/campaigns/queries";
import type { CampaignLeadRow } from "@/lib/campaigns/constants";
import { AddLeadsDialog } from "./AddLeadsDialog";
import { removeLeadFromCampaign } from "./actions";

type Props = {
    campaignId: string;
    campaignName: string;
    campaignLeads: CampaignLeadRow[];
    availableLeads: AvailableLead[];
};

function formatDate(value: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(d);
}

export function CampaignLeadsSection({
    campaignId,
    campaignName,
    campaignLeads,
    availableLeads,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);

    function handleRemove(campaignLeadId: string) {
        setRemoving(campaignLeadId);
        startTransition(async () => {
            const result = await removeLeadFromCampaign(campaignLeadId);
            if (result.ok) {
                toast.success("Lead removed");
                router.refresh();
            } else {
                toast.error(result.error);
            }
            setRemoving(null);
        });
    }

    return (
        <>
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle>
                                Leads in this campaign
                                <span className="ml-2 text-base font-normal text-slate-400 dark:text-slate-500">
                                    ({campaignLeads.length})
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Leads enrolled in{" "}
                                <span className="font-medium">{campaignName}</span>.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add leads
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {campaignLeads.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
                            <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                No leads in this campaign yet.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDialogOpen(true)}
                                disabled={availableLeads.length === 0}
                            >
                                <Plus className="h-4 w-4" />
                                Add your first lead
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                        <th className="py-2 pr-4 font-medium">Lead</th>
                                        <th className="py-2 pr-4 font-medium">Company</th>
                                        <th className="py-2 pr-4 font-medium">Status</th>
                                        <th className="py-2 pr-4 font-medium">Contacted</th>
                                        <th className="py-2 pr-4 font-medium">Responded</th>
                                        <th className="py-2 pr-0 font-medium text-right" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaignLeads.map((row) => {
                                        const lead = row.lead;
                                        const isRemoving = removing === row.id;
                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                                            >
                                                <td className="py-3 pr-4">
                                                    {lead ? (
                                                        <Link
                                                            href={`/leads/${lead.id}`}
                                                            className="font-medium text-slate-950 hover:text-indigo-600 dark:text-slate-50 dark:hover:text-indigo-400"
                                                        >
                                                            {lead.contact_name ||
                                                                lead.contact_email ||
                                                                "Unnamed"}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                                                    {lead?.company_name ?? "—"}
                                                </td>
                                                <td className="py-3 pr-4 capitalize text-slate-600 dark:text-slate-400">
                                                    {row.status ?? "—"}
                                                </td>
                                                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                                                    {row.contacted_at ? formatDate(row.contacted_at) : "—"}
                                                </td>
                                                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                                                    {row.responded_at ? formatDate(row.responded_at) : "—"}
                                                </td>
                                                <td className="py-3 pr-0 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                        onClick={() => handleRemove(row.id)}
                                                        disabled={isPending && isRemoving}
                                                        aria-label="Remove lead from campaign"
                                                    >
                                                        {isRemoving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {dialogOpen && (
                <AddLeadsDialog
                    campaignId={campaignId}
                    leads={availableLeads}
                    onClose={() => setDialogOpen(false)}
                />
            )}
        </>
    );
}