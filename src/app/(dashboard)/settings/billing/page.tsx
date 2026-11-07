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
import { CreditCard, FileText, Receipt, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Billing | B2B Lead Gen",
  description: "Manage your subscription, invoices, and payment methods.",
};

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string | null;
};

type SubscriptionRow = {
  id: string;
  plan_id: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  trial_end: string | null;
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

const sections = [
  {
    href: "/settings/billing/subscription",
    title: "Subscription",
    description: "View your plan, seats, and renewal date.",
    icon: Receipt,
  },
  {
    href: "/settings/billing/invoices",
    title: "Invoices",
    description: "Download past invoices and receipts.",
    icon: FileText,
  },
  {
    href: "/settings/billing/payment-methods",
    title: "Payment methods",
    description: "Manage cards used for billing.",
    icon: CreditCard,
  },
];

export default async function BillingSettingsPage() {
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
      "id, plan_id, status, current_period_end, cancel_at_period_end, trial_end"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  let plan: PlanRow | null = null;
  if (subscription?.plan_id) {
    const { data } = await supabase
      .from("subscription_plans")
      .select("id, name, description, price_monthly, price_yearly, currency")
      .eq("id", subscription.plan_id)
      .maybeSingle();
    plan = data ?? null;
  }

  const sub = (subscription ?? null) as SubscriptionRow | null;

  const hasActiveSub =
    !!sub &&
    !!sub.status &&
    ["active", "trialing", "past_due"].includes(sub.status.toLowerCase());

  const planName = plan?.name ?? (hasActiveSub ? "—" : "Free");
  const planDetail = hasActiveSub
    ? plan
      ? `${formatPrice(plan.price_monthly, plan.currency)} / month`
      : "Active subscription"
    : "No active subscription";

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Billing" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Billing
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your subscription, invoices, and payment methods.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Your subscription and renewal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
                {planName}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {planDetail}
              </p>

              {hasActiveSub && sub?.current_period_end && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {sub.cancel_at_period_end
                    ? `Cancels on ${formatDate(sub.current_period_end)}`
                    : `Renews on ${formatDate(sub.current_period_end)}`}
                </p>
              )}

              {hasActiveSub && sub?.trial_end && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Trial ends {formatDate(sub.trial_end)}
                </p>
              )}

              {sub?.status && (
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status: {sub.status}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/pricing">Compare plans</Link>
              </Button>
              <Button asChild>
                <Link href="/settings/billing/subscription">
                  {hasActiveSub ? "Manage plan" : "Upgrade"}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Card
            key={href}
            className="border-slate-200 transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="mt-3">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={href}>
                  Open
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}