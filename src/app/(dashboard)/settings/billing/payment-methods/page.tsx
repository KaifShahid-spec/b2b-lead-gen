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
import { CreditCard, Info } from "lucide-react";

export const metadata = {
  title: "Payment Methods | B2B Lead Gen",
  description: "Manage the cards used for your subscription.",
};

export default async function PaymentMethodsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasStripeCustomer = !!subscription?.stripe_customer_id;
  const hasActive =
    !!subscription?.status &&
    ["active", "trialing", "past_due"].includes(subscription.status.toLowerCase());

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Billing", href: "/settings/billing" },
          { label: "Payment methods" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Payment methods
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Cards used for your subscription and one-time charges.
        </p>
      </div>

      {!hasActive ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <CardTitle className="mt-3">No payment methods</CardTitle>
            <CardDescription>
              You don&apos;t have an active subscription, so there are no cards on
              file. Payment methods are added automatically when you subscribe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">View plans</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Cards on file</CardTitle>
              <CardDescription>
                Your payment methods are stored securely by Stripe. Card details
                never touch our servers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium">Stripe Customer Portal</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    To add, update, or remove cards, use the secure Stripe billing
                    portal. This feature is being wired up — check back soon.
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" disabled>
                <span>Open Stripe portal (coming soon)</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Billing details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">
                  Stripe customer ID
                </span>
                <span className="truncate font-mono text-xs text-slate-950 dark:text-slate-50">
                  {subscription?.stripe_customer_id}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">Status</span>
                <span className="capitalize text-slate-950 dark:text-slate-50">
                  {subscription?.status ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Related</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/settings/billing/subscription">Subscription</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/billing/invoices">Invoices</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}