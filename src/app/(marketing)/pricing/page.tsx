import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Check, X } from "lucide-react";

export const metadata = {
  title: "Pricing | Lead Gen SaaS",
  description: "Simple, transparent pricing that scales with your team.",
};

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string | null;
  features: unknown;
  is_default: boolean | null;
  display_order: number | null;
};

function formatPrice(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  const cur = (currency ?? "usd").toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function normalizeFeatures(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.filter((x): x is string => typeof x === "string");
  }
  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>)
      .filter(([, v]) => v === true || v === "true")
      .map(([k]) => k.replace(/_/g, " "));
  }
  return [];
}

const FALLBACK: PlanRow[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic lead management.",
    price_monthly: 0,
    price_yearly: 0,
    currency: "usd",
    features: ["Up to 100 leads", "1 user", "CSV import"],
    is_default: true,
    display_order: 0,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more leads.",
    price_monthly: 2900,
    price_yearly: 29000,
    currency: "usd",
    features: ["Unlimited leads", "Up to 5 users", "AI enrichment", "Email campaigns"],
    is_default: false,
    display_order: 1,
  },
  {
    id: "business",
    name: "Business",
    description: "Advanced features for scaling sales orgs.",
    price_monthly: 9900,
    price_yearly: 99000,
    currency: "usd",
    features: ["Everything in Pro", "Unlimited users", "Priority support", "Custom integrations"],
    is_default: false,
    display_order: 2,
  },
];

export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("subscription_plans")
    .select("id, name, description, price_monthly, price_yearly, currency, features, is_default, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const plans: PlanRow[] = (data && data.length > 0 ? data : FALLBACK) as PlanRow[];

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
          Pricing
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
          Simple pricing that scales with you
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
          Start free. Upgrade when your team needs more. Cancel any time.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const features = normalizeFeatures(plan.features);
            const isFree = (plan.price_monthly ?? 0) === 0;
            const ctaLabel = isFree ? "Start free" : "Start free trial";
            const ctaHref = `/signup?plan=${encodeURIComponent(plan.name.toLowerCase())}`;

            return (
              <Card
                key={plan.id}
                className={`flex flex-col border-slate-200 dark:border-slate-800 ${plan.is_default ? "" : "relative"
                  }`}
              >
                {!isFree && plan.name === "Pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                      Most popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                      {formatPrice(plan.price_monthly, plan.currency)}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      / month
                    </span>
                  </div>

                  {features.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="capitalize">{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <X className="h-4 w-4" />
                      No features listed yet.
                    </p>
                  )}

                  <div className="mt-auto">
                    <Button asChild className="w-full" variant={isFree ? "outline" : "default"}>
                      <Link href={ctaHref}>{ctaLabel}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          All plans include unlimited lead imports, CSV export, and access to our API.
        </p>
      </section>
    </>
  );
}