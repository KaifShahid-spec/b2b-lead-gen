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
import { FileText, ExternalLink, Download } from "lucide-react";

export const metadata = {
  title: "Invoices | B2B Lead Gen",
  description: "View and download your billing history.",
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  stripe_invoice_id: string | null;
  amount_paid: number | null;
  amount_due: number | null;
  currency: string | null;
  status: string | null;
  created_at: string | null;
  paid_at: string | null;
  invoice_pdf_url: string | null;
  invoice_url: string | null;
  hosted_invoice_url: string | null;
};

function formatAmount(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  const cur = (currency ?? "usd").toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(cents / 100);
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

function statusBadgeClass(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s === "paid") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (s === "open") return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  if (["void", "uncollectible"].includes(s))
    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function invoiceLabel(inv: InvoiceRow) {
  if (inv.invoice_number) return inv.invoice_number;
  if (inv.stripe_invoice_id) return inv.stripe_invoice_id;
  return inv.id.slice(0, 8).toUpperCase();
}

export default async function InvoicesPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, stripe_invoice_id, amount_paid, amount_due, currency, status, created_at, paid_at, invoice_pdf_url, invoice_url, hosted_invoice_url"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (invoices ?? []) as InvoiceRow[];

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Billing", href: "/settings/billing" },
          { label: "Invoices" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your billing history. Invoices are generated after each payment.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>
            {rows.length
              ? `${rows.length} invoice${rows.length === 1 ? "" : "s"}`
              : "No invoices yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No invoices yet. Once you subscribe and receive your first bill,
                it will appear here.
              </p>
              <Button asChild variant="outline">
                <Link href="/pricing">View plans</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-4 font-medium">Invoice</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inv) => {
                    const pdf = inv.invoice_pdf_url;
                    const hosted = inv.hosted_invoice_url ?? inv.invoice_url;
                    const amount =
                      inv.amount_paid != null
                        ? inv.amount_paid
                        : inv.amount_due;
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-slate-950 dark:text-slate-50">
                          {invoiceLabel(inv)}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                          {formatDate(inv.paid_at ?? inv.created_at)}
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-950 dark:text-slate-50">
                          {formatAmount(amount, inv.currency)}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(inv.status)}`}
                          >
                            {inv.status ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-0">
                          <div className="flex items-center justify-end gap-2">
                            {hosted && (
                              <a
                                href={hosted}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {pdf && (
                              <a
                                href={pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                PDF
                                <Download className="h-3 w-3" />
                              </a>
                            )}
                            {!hosted && !pdf && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Related</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/settings/billing/subscription">Subscription</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/billing/payment-methods">Payment methods</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}