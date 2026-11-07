import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthWorkspaceInput } from "@/lib/auth/schemas";

const DEFAULT_TEAM_PREFIX = "My Team";

// src/lib/auth/workspace.ts

export type WorkspaceProfile = {
  id: string
  email: string
  name: string | null
  company_name?: string | null
  website?: string | null
  industry?: string | null
  company_size?: string | null
  avatar_url?: string | null
  onboarding_completed: boolean
  onboarding_step: number
}

type WorkspaceTeam = {
  id: string;
  name: string;
};

export type WorkspaceContext = {
  profile: WorkspaceProfile | null;
  team: WorkspaceTeam | null;
};

const PROFILE_COLUMNS =
  "id, email, name, onboarding_completed, onboarding_step, company_name, website, industry, company_size, onboarding_goal";

export async function ensureUserWorkspace(input: AuthWorkspaceInput) {
  const supabase = createSupabaseAdminClient();

  const fullName = input.fullName ?? input.email.split("@")[0];
  const teamName =
    input.companyName ?? `${fullName}'s ${DEFAULT_TEAM_PREFIX}`;

  const profilePayload = {
    id: input.userId,
    email: input.email,
    name: fullName,
    onboarding_completed: false,
    onboarding_step: 1,
  };

  const { error: profileError } = await supabase
    .from("users")
    .upsert(profilePayload, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  const { data: existingTeams, error: teamLookupError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("owner_id", input.userId)
    .limit(1);

  if (teamLookupError) {
    throw teamLookupError;
  }

  let team: WorkspaceTeam | null = existingTeams?.[0] ?? null;

  if (!team) {
    const { data: createdTeam, error: teamCreateError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        owner_id: input.userId,
      })
      .select("id, name")
      .single();

    if (teamCreateError) {
      throw teamCreateError;
    }

    team = createdTeam;
  }

  const { data: existingMembership, error: membershipLookupError } =
    await supabase
      .from("team_members")
      .select("team_id, user_id")
      .eq("team_id", team.id)
      .eq("user_id", input.userId)
      .maybeSingle();

  if (membershipLookupError) {
    throw membershipLookupError;
  }

  if (!existingMembership) {
    const { error: membershipInsertError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: input.userId,
        role: "owner",
      });

    if (membershipInsertError) {
      throw membershipInsertError;
    }
  }

  return {
    profile: profilePayload as WorkspaceProfile,
    team,
  };
}

export async function ensureWorkspaceFromAuthUser(input: {
  userId: string;
  email: string;
  fullName?: string | null;
  companyName?: string | null;
}) {
  return ensureUserWorkspace({
    userId: input.userId,
    email: input.email,
    fullName: input.fullName ?? undefined,
    companyName: input.companyName ?? undefined,
  });
}

export async function completeOnboarding(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function getWorkspaceProfile(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWorkspaceContext(
  userId: string
): Promise<WorkspaceContext> {
  const supabase = createSupabaseAdminClient();

  const [profileResult, teamResult] = await Promise.all([
    supabase
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("teams")
      .select("id, name")
      .eq("owner_id", userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (teamResult.error) {
    throw teamResult.error;
  }

  return {
    profile: (profileResult.data as WorkspaceProfile | null) ?? null,
    team: teamResult.data ?? null,
  };
}