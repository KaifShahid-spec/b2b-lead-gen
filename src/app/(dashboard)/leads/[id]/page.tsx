import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLeadById } from "@/lib/leads/queries";
import { LeadDetailHeader } from "@/components/leads/LeadDetailHeader";
import { LeadNotes } from "@/components/leads/LeadNotes";
import { TagManager } from "@/components/leads/TagManager";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import type { LeadTag } from "@/types/lead";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id).catch(() => null);
  if (!lead) return { title: "Lead not found" };
  const name =
    lead.contact_name ?? lead.company_name ?? lead.contact_email ?? "Lead";
  return { title: `${name} | Leads` };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const initialNotes = lead.notes ?? [];

  // lead.tags is string[] in the DB (from `Lead`),
  // but LeadWithRelations also declares tags?: LeadTag[].
  // Cast explicitly to string[] to avoid the type intersection ambiguity.
  const rawTags = (lead.tags ?? []) as unknown as string[];
  const initialTags: LeadTag[] = rawTags.map((name) => ({
    id: name,
    name,
    color: "#6366f1",
  }));

  const displayName =
    lead.contact_name || lead.contact_email || lead.company_name || "Lead";

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads", href: "/leads" },
          { label: displayName },
        ]}
      />

      <LeadDetailHeader lead={lead} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadNotes leadId={lead.id} initialNotes={initialNotes} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagManager leadId={lead.id} initialTags={initialTags} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline leadId={lead.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}