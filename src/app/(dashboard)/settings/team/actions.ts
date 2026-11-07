"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function assertOwnerOfTeam(teamId: string) {
    const authClient = await createSupabaseServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const admin = createSupabaseAdminClient();
    const { data: team } = await admin
        .from("teams")
        .select("id, owner_id")
        .eq("id", teamId)
        .maybeSingle();

    if (!team) throw new Error("Team not found.");
    if (team.owner_id !== user.id) throw new Error("Only the team owner can manage members.");

    return { admin, userId: user.id };
}

export async function inviteMember(input: {
    teamId: string;
    email: string;
    role: string;
}): Promise<{ ok: true; message?: string } | { ok: false; error: string }> {
    try {
        const email = input.email?.trim().toLowerCase();
        if (!email) return { ok: false, error: "Email is required." };

        const { admin } = await assertOwnerOfTeam(input.teamId);

        const { data: targetUser } = await admin
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (!targetUser) {
            return {
                ok: false,
                error: "No account found with that email. Ask them to sign up first.",
            };
        }

        const { error } = await admin
            .from("team_members")
            .upsert(
                {
                    team_id: input.teamId,
                    user_id: targetUser.id,
                    role: input.role,
                    is_active: true,
                },
                { onConflict: "team_id,user_id" }
            );

        if (error) return { ok: false, error: error.message };

        revalidatePath("/settings/team");
        return { ok: true, message: "Member added." };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Unknown error." };
    }
}

export async function updateMemberRole(input: {
    memberId: string;
    role: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const admin = createSupabaseAdminClient();

        const { data: member } = await admin
            .from("team_members")
            .select("id, team_id, user_id")
            .eq("id", input.memberId)
            .maybeSingle();

        if (!member) return { ok: false, error: "Member not found." };

        await assertOwnerOfTeam(member.team_id);

        const { error } = await admin
            .from("team_members")
            .update({ role: input.role })
            .eq("id", input.memberId);

        if (error) return { ok: false, error: error.message };

        revalidatePath("/settings/team");
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Unknown error." };
    }
}

export async function removeMember(input: {
    memberId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const admin = createSupabaseAdminClient();

        const { data: member } = await admin
            .from("team_members")
            .select("id, team_id, user_id")
            .eq("id", input.memberId)
            .maybeSingle();

        if (!member) return { ok: false, error: "Member not found." };

        const { userId } = await assertOwnerOfTeam(member.team_id);

        if (member.user_id === userId) {
            return { ok: false, error: "You cannot remove yourself (the owner)." };
        }

        const { error } = await admin
            .from("team_members")
            .delete()
            .eq("id", input.memberId);

        if (error) return { ok: false, error: error.message };

        revalidatePath("/settings/team");
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Unknown error." };
    }
}