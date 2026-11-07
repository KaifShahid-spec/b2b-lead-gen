"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Upload, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { finishOnboardingAction, finishAndImportAction } from "../actions";

type Props = {
    companyName: string | null;
    goal: string | null;
};

export function FinishPanel({ companyName, goal }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleFinish() {
        startTransition(async () => {
            await finishOnboardingAction();
        });
    }

    function handleImport() {
        startTransition(async () => {
            await finishAndImportAction();
        });
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-slate-50">
                    You&apos;re all set{companyName ? `, ${companyName}` : ""}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                    {goal === "find_leads"
                        ? "Let's get your first leads in."
                        : goal === "run_outbound"
                            ? "Ready to launch your first campaign?"
                            : "Jump straight into your workspace."}
                </p>

                <div className="mt-8 flex flex-col items-center gap-3">
                    <Button
                        onClick={handleImport}
                        disabled={isPending}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Upload className="h-4 w-4" />
                        Import leads now
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                        onClick={handleFinish}
                        disabled={isPending}
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to dashboard
                    </Button>
                </div>

                <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                    You can import leads any time from the Leads page.
                </p>
            </CardContent>
        </Card>
    );
}