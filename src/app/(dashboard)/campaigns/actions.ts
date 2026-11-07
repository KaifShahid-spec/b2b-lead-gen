"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, requireWorkspace } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CAMPAIGN_TYPES } from "@/lib/campaigns/constants";

const ALLOWED_STATUSES = ["draft", "active", "paused", "completed", "archived"] as const;

type CreateCampaignInput = {
    name: string;
    description?: string;
    type: string;
    status: string;
    target_industries?: string[];
    target_locations?: string[];
    target_company_sizes?: string[];
    target_job_titles?: string[];
    start_date?: string | null;
    end_date?: string | null;
    timezone?: string;
    ai_personalization?: boolean;
};

function cleanArray(input: string[] | undefined): string[] {
    if (!Array.isArray(input)) return [];
    return input.map((s) => s.trim()).filter(Boolean).slice(0, 50);
}

export async function createCampaign(
    input: CreateCampaignInput
): Promise<{ ok: false; error: string }> {
    const user = await requireUser();
    const workspace = await requireWorkspace();
    const teamId = workspace.team?.id;

    if (!teamId) {
        return { ok: false, error: "No team found for this workspace." };
    }

    const name = input.name?.trim();
    if (!name) return { ok: false, error: "Campaign name is required." };
    if (name.length > 120) return { ok: false, error: "Name is too long (120 max)." };

    const validType = CAMPAIGN_TYPES.some((t) => t.value === input.type);
    const type = validType ? input.type : "email";

    const status = ALLOWED_STATUSES.includes(input.status as typeof ALLOWED_STATUSES[number])
        ? input.status
        : "draft";

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            user_id: user.id,
            team_id: teamId,
            name,
            description: input.description?.trim() || null,
            type,
            status,
            target_industries: cleanArray(input.target_industries),
            target_locations: cleanArray(input.target_locations),
            target_company_sizes: cleanArray(input.target_company_sizes),
            target_job_titles: cleanArray(input.target_job_titles),
            start_date: input.start_date || null,
            end_date: input.end_date || null,
            timezone: input.timezone || "UTC",
            ai_personalization: input.ai_personalization ?? false,
        })
        .select("id")
        .single();

    if (error) {
        return { ok: false, error: error.message };
    }

    revalidatePath("/campaigns");
    redirect(`/campaigns/${data.id}`);
}