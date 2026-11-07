"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailableLead } from "@/lib/campaigns/queries";
import { addLeadsToCampaign } from "./actions";

type Props = {
    campaignId: string;
    leads: AvailableLead[];
    onClose: () => void;
};

export function AddLeadsDialog({ campaignId, leads, onClose }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return leads;
        return leads.filter((l) => {
            const haystack = [
                l.contact_name,
                l.contact_email,
                l.company_name,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [leads, search]);

    function toggle(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        setSelected((prev) => {
            if (prev.size === filtered.length && filtered.length > 0) {
                return new Set();
            }
            return new Set(filtered.map((l) => l.id));
        });
    }

    function handleSubmit() {
        if (selected.size === 0) {
            setError("Select at least one lead.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await addLeadsToCampaign(campaignId, Array.from(selected));

            if (result.ok) {
                toast.success(`Added ${result.added} lead${result.added === 1 ? "" : "s"}`);
                onClose();
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                            Add leads to campaign
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {leads.length} available
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or company…"
                            className="pl-9"
                        />
                    </div>

                    {filtered.length > 0 && (
                        <div className="mt-3 flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                {selected.size === filtered.length ? "Deselect all" : "Select all"}
                            </button>
                            {selected.size > 0 && (
                                <span className="text-slate-500 dark:text-slate-400">
                                    {selected.size} selected
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {leads.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                All your leads are already in this campaign.
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                            No leads match &ldquo;{search}&rdquo;
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {filtered.map((lead) => {
                                const isSelected = selected.has(lead.id);
                                const name =
                                    lead.contact_name || lead.contact_email || "Unnamed";
                                return (
                                    <li key={lead.id}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(lead.id)}
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition",
                                                isSelected
                                                    ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                                                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition",
                                                    isSelected
                                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                                        : "border-slate-300 dark:border-slate-600"
                                                )}
                                            >
                                                {isSelected && (
                                                    <svg
                                                        className="h-3 w-3"
                                                        viewBox="0 0 12 12"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M2.5 6L5 8.5L9.5 3.5"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                                                    {name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                    {lead.company_name}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                                                    {lead.status}
                                                </p>
                                                {lead.ai_score != null && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        score {lead.ai_score}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                    {error && (
                        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                    <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={isPending || selected.size === 0}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding…
                                </>
                            ) : (
                                `Add ${selected.size || ""} lead${selected.size === 1 ? "" : "s"}`
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}