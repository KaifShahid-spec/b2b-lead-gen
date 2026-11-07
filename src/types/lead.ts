export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "archived",
] as const;

export const LEAD_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export const LEAD_SOURCES = [
  "website",
  "referral",
  "linkedin",
  "cold_email",
  "inbound",
  "event",
  "partner",
  "other",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type LeadTag = {
  id: string;
  name: string;
  color?: string;
};

export type Lead = {
  id: string;
  user_id: string | null;
  team_id: string | null;

  company_name: string;
  company_website: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_linkedin_url: string | null;
  company_description: string | null;

  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_title: string | null;
  contact_linkedin_url: string | null;

  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;

  ai_score: number | null;
  ai_score_reason: string | null;
  ai_confidence: number | null;

  enrichment_data: Record<string, unknown> | null;

  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource | null;
  source_url: string | null;

  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  engagement_score: number;

  is_archived: boolean;
  deleted_at: string | null;

  tags: string[] | null;
  custom_fields: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
};

export type LeadWithRelations = Lead & {
  tags?: LeadTag[];
  activities?: LeadActivity[];
  notes?: LeadNote[];
};

export type LeadActivity = {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  activity_type: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type LeadNote = {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
};

export type LeadsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LeadStatus | "all";
  priority?: LeadPriority | "all";
  source?: LeadSource | "all";
  sortBy?: keyof Lead;
  sortDir?: "asc" | "desc";
  archived?: boolean;
  tags?: string[];
};

export type LeadsPaginatedResult = {
  data: Lead[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateLeadInput = {
  company_name: string;
  company_website?: string;
  company_industry?: string;
  company_size?: string;
  company_linkedin_url?: string;
  company_description?: string;

  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_title?: string;
  contact_linkedin_url?: string;

  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  ai_score?: number;
  ai_score_reason?: string;
  ai_confidence?: number;

  enrichment_data?: Record<string, unknown>;

  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  source_url?: string;

  last_contacted_at?: string;
  next_follow_up_at?: string;
  engagement_score?: number;

  is_archived?: boolean;
  custom_fields?: Record<string, unknown>;
  tags?: string[];
};

export type UpdateLeadInput = Partial<CreateLeadInput>;