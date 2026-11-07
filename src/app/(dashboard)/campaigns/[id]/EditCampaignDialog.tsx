"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    CAMPAIGN_TYPES,
    CAMPAIGN_TIMEZONES,
    CAMPAIGN_COMPANY_SIZES,
    type Campaign,
} from "@/lib/campaigns/constants";
import { updateCampaignDetails } from "./actions";

function TagInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder: string;
}) {
    const [draft, setDraft] = useState("");

    function commit() {
        const trimmed = draft.trim();
        if (!trimmed || value.includes(trimmed)) {
            setDraft("");
            return;
        }
        onChange([...value, trimmed]);
        setDraft("");
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => onChange(value.filter((t) => t !== tag))}
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        commit();
                    }
                }}
                onBlur={commit}
                placeholder={placeholder}
            />
        </div>
    );
}

export function EditCampaignDialog({
    campaign,
    onClose,
}: {
    campaign: Campaign;
    onClose: () => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState(campaign.name);
    const [description, setDescription] = useState(campaign.description ?? "");
    const [type, setType] = useState(campaign.type ?? "email");
    const [industries, setIndustries] = useState<string[]>(campaign.target_industries ?? []);
    const [locations, setLocations] = useState<string[]>(campaign.target_locations ?? []);
    const [sizes, setSizes] = useState<string[]>(campaign.target_company_sizes ?? []);
    const [titles, setTitles] = useState<string[]>(campaign.target_job_titles ?? []);
    const [startDate, setStartDate] = useState(
        campaign.start_date ? campaign.start_date.slice(0, 10) : ""
    );
    const [endDate, setEndDate] = useState(
        campaign.end_date ? campaign.end_date.slice(0, 10) : ""
    );
    const [timezone, setTimezone] = useState(campaign.timezone ?? "UTC");
    const [ai, setAi] = useState(Boolean(campaign.ai_personalization));

    function toggleSize(size: string) {
        setSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await updateCampaignDetails(campaign.id, {
                name,
                description,
                type,
                target_industries: industries,
                target_locations: locations,
                target_company_sizes: sizes,
                target_job_titles: titles,
                start_date: startDate || null,
                end_date: endDate || null,
                timezone,
                ai_personalization: ai,
            });

            if (result.ok) {
                toast.success("Campaign updated");
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

            <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                        Edit campaign
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name *</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={120}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Type</Label>
                            <select
                                id="edit-type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {CAMPAIGN_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-timezone">Timezone</Label>
                            <select
                                id="edit-timezone"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {CAMPAIGN_TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Industries</Label>
                        <TagInput value={industries} onChange={setIndustries} placeholder="Add industry…" />
                    </div>

                    <div className="space-y-2">
                        <Label>Locations</Label>
                        <TagInput value={locations} onChange={setLocations} placeholder="Add location…" />
                    </div>

                    <div className="space-y-2">
                        <Label>Company sizes</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {CAMPAIGN_COMPANY_SIZES.map((size) => {
                                const isActive = sizes.includes(size);
                                return (
                                    <button
                                        type="button"
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={cn(
                                            "rounded-full border px-3 py-1 text-xs font-medium transition",
                                            isActive
                                                ? "border-indigo-500 bg-indigo-600 text-white"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                        )}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Job titles</Label>
                        <TagInput value={titles} onChange={setTitles} placeholder="Add job title…" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-start">Start date</Label>
                            <Input
                                id="edit-start"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-end">End date</Label>
                            <Input
                                id="edit-end"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={ai}
                            onChange={(e) => setAi(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                        />
                        <div>
                            <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                                AI personalization
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Let AI tailor each message based on lead data.
                            </p>
                        </div>
                    </label>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving…" : "Save changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}