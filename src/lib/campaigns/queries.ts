import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/auth";
import type { Campaign, CampaignLeadRow } from "./constants";

export type { Campaign, CampaignLeadRow } from "./constants";
export {
    CAMPAIGN_STATUSES,
    CAMPAIGN_TYPES,
    CAMPAIGN_TIMEZONES,
    CAMPAIGN_COMPANY_SIZES,
} from "./constants";
export type {
    CampaignStatus,
    CampaignType,
    CampaignTimezone,
} from "./constants";

export type AvailableLead = {
    id: string;
    contact_name: string | null;
    contact_email: string | null;
    company_name: string;
    status: string;
    ai_score: number | null;
};

async function getTeamId() {
    const workspace = await requireWorkspace();
    const teamId = workspace.team?.id;
    if (!teamId) throw new Error("No team found for this workspace.");
    return teamId;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const teamId = await getTeamId();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("team_id", teamId)
        .maybeSingle();

    if (error) throw error;
    return (data as Campaign | null) ?? null;
}

export async function updateCampaign(
    id: string,
    patch: Partial<Pick<Campaign, "name" | "description" | "status">>
): Promise<Campaign> {
    const teamId = await getTeamId();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("campaigns")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("team_id", teamId)
        .select("*")
        .single();

    if (error) throw error;
    return data as Campaign;
}

export async function getCampaignLeads(
    campaignId: string
): Promise<CampaignLeadRow[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("campaign_leads")
        .select(
            `
      id,
      campaign_id,
      lead_id,
      status,
      contacted_at,
      responded_at,
      converted_at,
      notes,
      created_at,
      lead:leads (
        id,
        contact_name,
        contact_email,
        company_name,
        status,
        ai_score
      )
    `
        )
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as CampaignLeadRow[];
}

export async function getAvailableLeadsForCampaign(
    campaignId: string
): Promise<AvailableLead[]> {
    const teamId = await getTeamId();
    const supabase = await createSupabaseServerClient();

    // Get IDs already in this campaign
    const { data: existing, error: existingError } = await supabase
        .from("campaign_leads")
        .select("lead_id")
        .eq("campaign_id", campaignId);

    if (existingError) throw existingError;

    const existingIds = new Set(
        (existing ?? []).map((r) => r.lead_id).filter((x): x is string => !!x)
    );

    // Get all active leads in the workspace
    const { data, error } = await supabase
        .from("leads")
        .select("id, contact_name, contact_email, company_name, status, ai_score")
        .eq("team_id", teamId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) throw error;

    return (data ?? [])
        .filter((lead) => !existingIds.has(lead.id))
        .map((lead) => ({
            id: lead.id,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            company_name: lead.company_name,
            status: lead.status,
            ai_score: lead.ai_score,
        })) as AvailableLead[];
}