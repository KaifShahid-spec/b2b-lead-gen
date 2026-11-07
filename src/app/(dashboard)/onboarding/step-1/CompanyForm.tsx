"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { saveCompanyStep, skipToStep } from "../actions";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

type Props = {
    initial: {
        company_name: string;
        website: string;
        industry: string;
        company_size: string;
    };
};

export function CompanyForm({ initial }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [companyName, setCompanyName] = useState(initial.company_name);
    const [website, setWebsite] = useState(initial.website);
    const [industry, setIndustry] = useState(initial.industry);
    const [companySize, setCompanySize] = useState(initial.company_size);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await saveCompanyStep({
                company_name: companyName,
                website,
                industry,
                company_size: companySize,
            });

            if (result.ok) {
                router.push("/onboarding/step-2");
            } else {
                setError(result.error);
            }
        });
    }

    function handleSkip() {
        startTransition(async () => {
            await skipToStep(2);
        });
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company name</Label>
                        <Input
                            id="company_name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Acme Inc."
                            maxLength={120}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://acme.com"
                            maxLength={200}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="SaaS, Fintech, Healthcare…"
                            maxLength={80}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company_size">Company size</Label>
                        <select
                            id="company_size"
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <option value="">Select a size…</option>
                            {COMPANY_SIZES.map((size) => (
                                <option key={size} value={size}>
                                    {size} employees
                                </option>
                            ))}
                        </select>
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

                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving…" : "Continue"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}