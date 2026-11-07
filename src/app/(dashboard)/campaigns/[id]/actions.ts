"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
    CAMPAIGN_STATUSES,
    CAMPAIGN_TYPES,
    type CampaignStatus,
} from "@/lib/campaigns/constants";

/* ────────────────────── STATUS ────────────────────── */

export async function updateCampaignStatus(
    id: string,
    status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        if (!CAMPAIGN_STATUSES.includes(status as CampaignStatus)) {
            return { ok: false, error: "Invalid status." };
        }

        const workspace = await requireWorkspace();
        const teamId = workspace.team?.id;
        if (!teamId) return { ok: false, error: "No team found." };

        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("campaigns")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("team_id", teamId);

        if (error) return { ok: false, error: error.message };

        revalidatePath(`/campaigns/${id}`);
        revalidatePath("/campaigns");
        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Update failed.",
        };
    }
}

/* ────────────────────── FULL EDIT ────────────────────── */

type UpdateCampaignInput = {
    name: string;
    description: string;
    type: string;
    target_industries: string[];
    target_locations: string[];
    target_company_sizes: string[];
    target_job_titles: string[];
    start_date: string | null;
    end_date: string | null;
    timezone: string;
    ai_personalization: boolean;
};

function cleanArray(input: string[] | undefined): string[] {
    if (!Array.isArray(input)) return [];
    return input.map((s) => s.trim()).filter(Boolean).slice(0, 50);
}

export async function updateCampaignDetails(
    id: string,
    input: UpdateCampaignInput
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const name = input.name?.trim();
        if (!name) return { ok: false, error: "Name is required." };
        if (name.length > 120) return { ok: false, error: "Name is too long." };

        const validType = CAMPAIGN_TYPES.some((t) => t.value === input.type);
        if (!validType) return { ok: false, error: "Invalid campaign type." };

        const workspace = await requireWorkspace();
        const teamId = workspace.team?.id;
        if (!teamId) return { ok: false, error: "No team found." };

        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from("campaigns")
            .update({
                name,
                description: input.description?.trim() || null,
                type: input.type,
                target_industries: cleanArray(input.target_industries),
                target_locations: cleanArray(input.target_locations),
                target_company_sizes: cleanArray(input.target_company_sizes),
                target_job_titles: cleanArray(input.target_job_titles),
                start_date: input.start_date || null,
                end_date: input.end_date || null,
                timezone: input.timezone || "UTC",
                ai_personalization: input.ai_personalization ?? false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("team_id", teamId);

        if (error) return { ok: false, error: error.message };

        revalidatePath(`/campaigns/${id}`);
        revalidatePath("/campaigns");
        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Update failed.",
        };
    }
}

/* ────────────────────── ADD LEADS ────────────────────── */

export async function addLeadsToCampaign(
    campaignId: string,
    leadIds: string[]
): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
    try {
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return { ok: false, error: "No leads selected." };
        }

        const workspace = await requireWorkspace();
        const teamId = workspace.team?.id;
        if (!teamId) return { ok: false, error: "No team found." };

        const supabase = await createSupabaseServerClient();

        // Verify campaign belongs to this team
        const { data: campaign, error: campaignError } = await supabase
            .from("campaigns")
            .select("id")
            .eq("id", campaignId)
            .eq("team_id", teamId)
            .maybeSingle();

        if (campaignError) return { ok: false, error: campaignError.message };
        if (!campaign) return { ok: false, error: "Campaign not found." };

        // Build rows, using ON CONFLICT-friendly upsert to be idempotent
        const rows = leadIds.map((leadId) => ({
            campaign_id: campaignId,
            lead_id: leadId,
            status: "pending",
        }));

        const { error } = await supabase
            .from("campaign_leads")
            .upsert(rows, { onConflict: "campaign_id,lead_id", ignoreDuplicates: true });

        if (error) return { ok: false, error: error.message };

        revalidatePath(`/campaigns/${campaignId}`);
        revalidatePath("/campaigns");
        return { ok: true, added: rows.length };
    } catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Add failed.",
        };
    }
}

/* ────────────────────── REMOVE LEAD ────────────────────── */

export async function removeLeadFromCampaign(
    campaignLeadId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: row, error: lookupError } = await supabase
            .from("campaign_leads")
            .select("id, campaign_id")
            .eq("id", campaignLeadId)
            .maybeSingle();

        if (lookupError) return { ok: false, error: lookupError.message };
        if (!row) return { ok: false, error: "Row not found." };

        // RLS policy will verify ownership via the campaign
        const { error } = await supabase
            .from("campaign_leads")
            .delete()
            .eq("id", campaignLeadId);

        if (error) return { ok: false, error: error.message };

        revalidatePath(`/campaigns/${row.campaign_id}`);
        revalidatePath("/campaigns");
        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Remove failed.",
        };
    }
}