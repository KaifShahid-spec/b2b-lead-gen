import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LeadForm } from "@/components/leads/LeadForm";
import { UserPlus } from "lucide-react";

export const metadata = {
  title: "New Lead | B2B Lead Gen",
  description: "Create a new B2B lead.",
};

export default function NewLeadPage() {
  return (
    <main className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads", href: "/leads" },
          { label: "New lead" },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
          <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Create new lead
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill in the details below — only a name or email is required.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <LeadForm />
      </div>
    </main>
  );
}
