"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Search, Workflow, Sparkles, Send, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveGoalStep, skipToStep } from "../actions";

const GOALS = [
    {
        value: "find_leads",
        label: "Find new leads",
        description: "Discover and capture new prospects.",
        icon: Search,
    },
    {
        value: "manage_pipeline",
        label: "Manage pipeline",
        description: "Track leads through your sales process.",
        icon: Workflow,
    },
    {
        value: "enrich_contacts",
        label: "Enrich contacts",
        description: "Add company data, emails, and signals.",
        icon: Sparkles,
    },
    {
        value: "run_outbound",
        label: "Run outbound campaigns",
        description: "Cold email, LinkedIn, and multi-channel.",
        icon: Send,
    },
    {
        value: "something_else",
        label: "Something else",
        description: "Just exploring for now.",
        icon: CircleDashed,
    },
];

type Props = {
    initial: {
        onboarding_goal: string;
    };
};

export function GoalForm({ initial }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState(initial.onboarding_goal);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!selected) {
            setError("Pick a goal to continue, or skip.");
            return;
        }

        startTransition(async () => {
            const result = await saveGoalStep({ onboarding_goal: selected });
            if (result.ok) {
                router.push("/onboarding/step-3");
            } else {
                setError(result.error);
            }
        });
    }

    function handleSkip() {
        startTransition(async () => {
            await skipToStep(3);
        });
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                            What brings you here?
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            We&apos;ll tailor the dashboard to match.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {GOALS.map(({ value, label, description, icon: Icon }) => {
                            const isActive = selected === value;
                            return (
                                <button
                                    type="button"
                                    key={value}
                                    onClick={() => setSelected(value)}
                                    className={cn(
                                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition",
                                        isActive
                                            ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                            isActive
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                                            {label}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {description}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isPending}
                        >
                            Skip
                        </Button>

                        <Button type="submit" disabled={isPending || !selected}>
                            {isPending ? "Saving…" : "Continue"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}