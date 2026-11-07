export type CampaignStatus =
    | "draft"
    | "active"
    | "paused"
    | "completed"
    | "archived";

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
    "draft",
    "active",
    "paused",
    "completed",
    "archived",
];

export const CAMPAIGN_TYPES = [
    { value: "email", label: "Email" },
    { value: "cold_call", label: "Cold call" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "ads", label: "Ads" },
    { value: "multi_channel", label: "Multi-channel" },
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number]["value"];

export const CAMPAIGN_TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Africa/Cairo",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
    "Pacific/Auckland",
] as const;

export type CampaignTimezone = (typeof CAMPAIGN_TIMEZONES)[number];

export const CAMPAIGN_COMPANY_SIZES = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "500+",
] as const;

export type Campaign = {
    id: string;
    user_id: string | null;
    team_id: string | null;
    name: string;
    description: string | null;
    type: string | null;
    status: CampaignStatus | string | null;
    target_industries: string[] | null;
    target_locations: string[] | null;
    target_company_sizes: string[] | null;
    target_job_titles: string[] | null;
    start_date: string | null;
    end_date: string | null;
    timezone: string | null;
    ai_personalization: boolean | null;
    ai_template_id: string | null;
    total_leads: number | null;
    contacted_count: number | null;
    response_count: number | null;
    conversion_count: number | null;
    settings: Record<string, unknown> | null;
    created_at: string | null;
    updated_at: string | null;
};

export type CampaignLeadRow = {
    id: string;
    campaign_id: string | null;
    lead_id: string | null;
    status: string | null;
    contacted_at: string | null;
    responded_at: string | null;
    converted_at: string | null;
    notes: string | null;
    created_at: string | null;
    lead?: {
        id: string;
        contact_name: string | null;
        contact_email: string | null;
        company_name: string;
        status: string;
        ai_score: number | null;
    } | null;
};