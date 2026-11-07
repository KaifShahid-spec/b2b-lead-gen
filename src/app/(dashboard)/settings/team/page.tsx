import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWorkspace } from "@/lib/auth";
import { TeamManager } from "./TeamManager";

export const metadata = {
  title: "Team Settings | B2B Lead Gen",
  description: "Manage your team members and invitations.",
};

export default async function TeamSettingsPage() {
  const workspace = await requireWorkspace();
  const team = workspace.team;

  if (!team) {
    redirect("/onboarding");
  }

  const supabase = createSupabaseAdminClient();

  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, user_id, role, is_active, created_at")
    .eq("team_id", team.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const userIds = (members ?? []).map((m) => m.user_id);

  const { data: users } = userIds.length
    ? await supabase
      .from("users")
      .select("id, email, name")
      .in("id", userIds)
    : { data: [] };

  const userMap = new Map(
    (users ?? []).map((u) => [u.id, { email: u.email, name: u.name }])
  );

  const enriched = (members ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role ?? "member",
    isActive: m.is_active ?? true,
    email: userMap.get(m.user_id)?.email ?? "",
    name: userMap.get(m.user_id)?.name ?? "",
  }));

  const { data: teamRow } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", team.id)
    .maybeSingle();

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Team" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Team
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage members of <span className="font-medium">{team.name}</span>.
        </p>
      </div>

      <TeamManager
        teamId={team.id}
        teamName={team.name}
        ownerId={teamRow?.owner_id ?? null}
        members={enriched}
      />
    </main>
  );
}