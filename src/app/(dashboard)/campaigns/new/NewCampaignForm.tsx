"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    CAMPAIGN_TYPES,
    CAMPAIGN_TIMEZONES,
    CAMPAIGN_COMPANY_SIZES,
} from "@/lib/campaigns/constants";
import { createCampaign } from "../actions";

const STATUSES = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
];

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

    function remove(tag: string) {
        onChange(value.filter((t) => t !== tag));
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
                            onClick={() => remove(tag)}
                            className="rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            aria-label={`Remove ${tag}`}
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Press Enter or comma to add.
            </p>
        </div>
    );
}

export function NewCampaignForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("email");
    const [status, setStatus] = useState("draft");
    const [industries, setIndustries] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [titles, setTitles] = useState<string[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [timezone, setTimezone] = useState("UTC");
    const [aiPersonalization, setAiPersonalization] = useState(false);

    function toggleSize(size: string) {
        setSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Campaign name is required.");
            return;
        }

        startTransition(async () => {
            const result = await createCampaign({
                name,
                description,
                type,
                status,
                target_industries: industries,
                target_locations: locations,
                target_company_sizes: sizes,
                target_job_titles: titles,
                start_date: startDate || null,
                end_date: endDate || null,
                timezone,
                ai_personalization: aiPersonalization,
            });

            if (result && !result.ok) {
                setError(result.error);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Basics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Q4 SaaS Outreach"
                            required
                            maxLength={120}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="What is this campaign about?"
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
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
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Targeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Industries</Label>
                        <TagInput
                            value={industries}
                            onChange={setIndustries}
                            placeholder="SaaS, Fintech, Healthcare…"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Locations</Label>
                        <TagInput
                            value={locations}
                            onChange={setLocations}
                            placeholder="United States, Canada, EU…"
                        />
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
                        <TagInput
                            value={titles}
                            onChange={setTitles}
                            placeholder="Head of Sales, VP Sales…"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Schedule & options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select
                                id="timezone"
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

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={aiPersonalization}
                            onChange={(e) => setAiPersonalization(e.target.checked)}
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
                </CardContent>
            </Card>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => history.back()} disabled={isPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating…" : "Create campaign"}
                </Button>
            </div>
        </form>
    );
}