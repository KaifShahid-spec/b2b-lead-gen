import type { ReactNode } from "react";
import { requireWorkspace } from "@/lib/auth";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { number: 1, label: "Company", href: "/onboarding/step-1" },
    { number: 2, label: "Goal", href: "/onboarding/step-2" },
    { number: 3, label: "Import", href: "/onboarding/step-3" },
];

export default async function OnboardingLayout({
    children,
}: {
    children: ReactNode;
}) {
    const workspace = await requireWorkspace();
    const currentStep = Math.min(
        Math.max(workspace.profile?.onboarding_completed ? 4 : 1, 1),
        3
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-2xl px-4 py-12">
                {/* Brand */}
                <div className="mb-10 text-center">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
                        Getting started
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                        Set up your workspace
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Three quick steps. You can skip anything.
                    </p>
                </div>

                {/* Step indicator */}
                <ol className="mb-8 flex items-center justify-center gap-2">
                    {STEPS.map((step, index) => {
                        const isDone = step.number < currentStep;
                        const isActive = step.number === currentStep;
                        return (
                            <li key={step.number} className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
                                            isDone &&
                                            "bg-emerald-600 text-white",
                                            isActive &&
                                            "bg-slate-950 text-white ring-2 ring-slate-300 dark:bg-slate-50 dark:text-slate-950 dark:ring-slate-700",
                                            !isDone &&
                                            !isActive &&
                                            "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        {isDone ? <Check className="h-4 w-4" /> : step.number}
                                    </span>
                                    <span
                                        className={cn(
                                            "hidden text-sm font-medium sm:inline",
                                            isActive
                                                ? "text-slate-950 dark:text-slate-50"
                                                : "text-slate-500 dark:text-slate-400"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {index < STEPS.length - 1 && (
                                    <span
                                        className={cn(
                                            "mx-2 h-px w-8 sm:w-12",
                                            step.number < currentStep
                                                ? "bg-emerald-500"
                                                : "bg-slate-200 dark:bg-slate-800"
                                        )}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>

                {children}
            </div>
        </div>
    );
}