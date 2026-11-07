import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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
  title: "Subscription | B2B Lead Gen",
  description: "View your current plan and billing details.",
};

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string | null;
  features: unknown;
  limits: unknown;
};

type SubscriptionRow = {
  id: string;
  plan_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  seats: number | null;
};

function formatPrice(amount: number | null, currency: string | null) {
  if (amount == null) return "—";
  const cur = (currency ?? "usd").toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

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

function normalizeFeatures(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.filter((x): x is string => typeof x === "string");
  }
  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>)
      .filter(([, v]) => v === true || v === "true")
      .map(([k]) => k);
  }
  return [];
}

function statusColor(status: string | null | undefined) {
  const s = (status ?? "").toLowerCase();
  if (["active", "trialing"].includes(s)) return "text-emerald-600 dark:text-emerald-400";
  if (["past_due", "unpaid"].includes(s)) return "text-amber-600 dark:text-amber-400";
  if (["canceled", "cancelled", "incomplete_expired"].includes(s)) return "text-red-600 dark:text-red-400";
  return "text-slate-600 dark:text-slate-400";
}

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select(
      "id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_start, trial_end, seats"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const sub = (subscription ?? null) as SubscriptionRow | null;

  let plan: PlanRow | null = null;
  if (sub?.plan_id) {
    const { data } = await supabase
      .from("subscription_plans")
      .select("id, name, description, price_monthly, price_yearly, currency, features, limits")
      .eq("id", sub.plan_id)
      .maybeSingle();
    plan = data ?? null;
  }

  const features = normalizeFeatures(plan?.features);

  const isTrial =
    !!sub?.trial_end && new Date(sub.trial_end).getTime() > Date.now();

  const hasActive =
    !!sub?.status &&
    ["active", "trialing", "past_due"].includes(sub.status.toLowerCase());

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Billing", href: "/settings/billing" },
          { label: "Subscription" },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Subscription
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Details for your current plan and billing cycle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/pricing">Compare plans</Link>
          </Button>
          <Button asChild>
            <Link href="/pricing">{hasActive ? "Change plan" : "Upgrade"}</Link>
          </Button>
        </div>
      </div>

      {!sub ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Free plan</CardTitle>
            <CardDescription>
              You&apos;re on the free tier. Upgrade any time to unlock more features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">See plans</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan?.name ?? "Subscription"}</span>
                {sub.status && (
                  <span className={`text-sm font-normal capitalize ${statusColor(sub.status)}`}>
                    {sub.status.replace(/_/g, " ")}
                  </span>
                )}
              </CardTitle>
              {plan?.description && (
                <CardDescription>{plan.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-950 dark:text-slate-50">
                  {formatPrice(plan?.price_monthly ?? null, plan?.currency ?? null)}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / month
                </span>
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Status
                  </dt>
                  <dd className={`mt-1 text-sm capitalize ${statusColor(sub.status)}`}>
                    {sub.status?.replace(/_/g, " ") ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Seats
                  </dt>
                  <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
                    {sub.seats ?? 1}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Current period
                  </dt>
                  <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
                    {formatDate(sub.current_period_start)} → {formatDate(sub.current_period_end)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {sub.cancel_at_period_end ? "Cancels on" : "Renews on"}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
                    {formatDate(sub.current_period_end)}
                  </dd>
                </div>
                {isTrial && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Trial ends
                    </dt>
                    <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
                      {formatDate(sub.trial_end)}
                    </dd>
                  </div>
                )}
                {sub.canceled_at && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Canceled on
                    </dt>
                    <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
                      {formatDate(sub.canceled_at)}
                    </dd>
                  </div>
                )}
              </dl>

              {sub.cancel_at_period_end && (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  Your subscription is scheduled to cancel on{" "}
                  <strong>{formatDate(sub.current_period_end)}</strong>. You&apos;ll
                  retain access until then.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Plan features</CardTitle>
              <CardDescription>What&apos;s included in your current plan.</CardDescription>
            </CardHeader>
            <CardContent>
              {features.length ? (
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="capitalize">{f.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <X className="h-4 w-4" />
                  No features listed for this plan yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Manage billing</CardTitle>
          <CardDescription>
            Update payment methods, download invoices, or cancel your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/settings/billing/payment-methods">Payment methods</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/billing/invoices">Invoices</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}