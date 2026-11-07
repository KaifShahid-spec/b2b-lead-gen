import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/auth";
import type {
  Lead,
  LeadWithRelations,
  LeadsQueryParams,
  LeadsPaginatedResult,
  CreateLeadInput,
  UpdateLeadInput,
  LeadActivity,
  LeadNote,
  LeadTag,
} from "@/types/lead";

// ─── helpers ──────────────────────────────────────────────────

async function getWorkspaceTeam() {
  const workspace = await requireWorkspace();
  const teamId = workspace.team?.id;

  if (!teamId) {
    throw new Error("No team found for this workspace.");
  }

  return {
    teamId,
    workspace,
  };
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  return user.id;
}

// ─── LIST / PAGINATE ─────────────────────────────────────────

export async function getLeads(
  params: LeadsQueryParams = {}
): Promise<LeadsPaginatedResult> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  const MAX_PAGE_SIZE = 100;
  const MAX_PAGE = 100000;

  const requestedPage = Number(params.page ?? 1);
  const requestedPageSize = Number(params.pageSize ?? 25);

  const page =
    Number.isInteger(requestedPage) && requestedPage >= 1
      ? Math.min(requestedPage, MAX_PAGE)
      : 1;

  const pageSize =
    Number.isInteger(requestedPageSize) && requestedPageSize >= 1
      ? Math.min(requestedPageSize, MAX_PAGE_SIZE)
      : 25;

  const search = params.search?.trim();

  const sortBy = params.sortBy ?? "created_at";
  const sortDir = params.sortDir === "asc" ? "asc" : "desc";

  const archived = params.archived === true;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const allowedSortCols = [
    "created_at",
    "updated_at",
    "contact_name",
    "contact_email",
    "company_name",
    "contact_title",
    "status",
    "priority",
    "ai_score",
    "last_contacted_at",
    "next_follow_up_at",
    "engagement_score",
  ] as const;

  const safeSortBy = allowedSortCols.includes(
    sortBy as (typeof allowedSortCols)[number]
  )
    ? sortBy
    : "created_at";

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("team_id", teamId)
    .eq("is_archived", archived);

  if (search) {
    const escapedSearch = search
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

    query = query.or(
      [
        `contact_name.ilike.%${escapedSearch}%`,
        `contact_email.ilike.%${escapedSearch}%`,
        `company_name.ilike.%${escapedSearch}%`,
        `contact_title.ilike.%${escapedSearch}%`,
        `company_industry.ilike.%${escapedSearch}%`,
      ].join(",")
    );
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.priority && params.priority !== "all") {
    query = query.eq("priority", params.priority);
  }

  if (params.source && params.source !== "all") {
    query = query.eq("source", params.source);
  }

  if (params.tags && params.tags.length > 0) {
    const cleanTags = params.tags
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (cleanTags.length > 0) {
      query = query.contains("tags", cleanTags);
    }
  }

  query = query
    .order(safeSortBy, {
      ascending: sortDir === "asc",
    })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  const leads = (data ?? []) as Lead[];
  const total = count ?? 0;

  return {
    data: leads,
    count: total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
// ─── GET SINGLE ───────────────────────────────────────────────

export async function getLeadById(
  id: string
): Promise<LeadWithRelations | null> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      lead_activities(
        id,
        lead_id,
        user_id,
        activity_type,
        description,
        metadata,
        created_at
      ),
      lead_notes(
        id,
        lead_id,
        user_id,
        content,
        is_internal,
        created_at,
        updated_at
      )
    `)
    .eq("id", id)
    .eq("team_id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  return data as unknown as LeadWithRelations;
}

// ─── CREATE ───────────────────────────────────────────────────

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { tags, ...rest } = input;

  const { data, error } = await supabase
    .from("leads")
    .insert({
      ...rest,
      user_id: userId,
      team_id: teamId,
      tags: tags ?? [],
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    data.id,
    userId,
    "created",
    {}
  );

  return data as Lead;
}

// ─── UPDATE ───────────────────────────────────────────────────

export async function updateLead(
  id: string,
  input: UpdateLeadInput
): Promise<Lead> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { tags, ...rest } = input;

  // Fetch the previous values for activity logging.
  const { data: oldLead, error: oldLeadError } = await supabase
    .from("leads")
    .select("status, priority")
    .eq("id", id)
    .eq("team_id", teamId)
    .single();

  if (oldLeadError) {
    throw oldLeadError;
  }

  const updateData = {
    ...rest,
    ...(tags !== undefined ? { tags } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .eq("team_id", teamId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (rest.status && rest.status !== oldLead.status) {
    await logActivity(
      id,
      userId,
      "status_changed",
      {
        from: oldLead.status,
        to: rest.status,
      }
    );
  }

  if (rest.priority && rest.priority !== oldLead.priority) {
    await logActivity(
      id,
      userId,
      "priority_changed",
      {
        from: oldLead.priority,
        to: rest.priority,
      }
    );
  }

  if (tags !== undefined) {
    await logActivity(
      id,
      userId,
      "tags_updated",
      {
        tags,
      }
    );
  }

  return data as Lead;
}

// ─── DELETE ───────────────────────────────────────────────────

export async function deleteLead(id: string): Promise<void> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("team_id", teamId);

  if (error) {
    throw error;
  }
}

// ─── ARCHIVE / RESTORE ────────────────────────────────────────

export async function archiveLead(id: string): Promise<Lead> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .update({
      is_archived: true,
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("team_id", teamId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await logActivity(id, userId, "archived", {});

  return data as Lead;
}

export async function restoreLead(id: string): Promise<Lead> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .update({
      is_archived: false,
      status: "new",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("team_id", teamId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await logActivity(id, userId, "restored", {});

  return data as Lead;
}

// ─── BULK ─────────────────────────────────────────────────────

export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .delete()
    .in("id", ids)
    .eq("team_id", teamId);

  if (error) {
    throw error;
  }
}

export async function bulkArchiveLeads(ids: string[]): Promise<void> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .update({
      is_archived: true,
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("team_id", teamId);

  if (error) {
    throw error;
  }

  await Promise.all(
    ids.map((id) =>
      logActivity(id, userId, "archived", {})
    )
  );
}

export async function bulkRestoreLeads(ids: string[]): Promise<void> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .update({
      is_archived: false,
      status: "new",
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("team_id", teamId);

  if (error) {
    throw error;
  }

  await Promise.all(
    ids.map((id) =>
      logActivity(id, userId, "restored", {})
    )
  );
}

// ─── NOTES ────────────────────────────────────────────────────

export async function createLeadNote(
  leadId: string,
  content: string
): Promise<LeadNote> {
  const { teamId } = await getWorkspaceTeam();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseServerClient();

  // Verify the lead belongs to the current workspace/team.
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("team_id", teamId)
    .single();

  if (leadError) {
    throw leadError;
  }

  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      lead_id: lead.id,
      user_id: userId,
      content,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await logActivity(
    leadId,
    userId,
    "note_added",
    {
      preview: content.slice(0, 80),
    }
  );

  return data as LeadNote;
}

export async function deleteLeadNote(noteId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("lead_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

// ─── TAGS ─────────────────────────────────────────────────────
//
// Live DB stores tags directly on leads.tags as text[].
// There is no separate lead_tags table in the live schema.
//
// LeadTag compatibility objects use the tag name as the ID.

export async function addLeadTag(
  leadId: string,
  name: string,
  color?: string
): Promise<LeadTag> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("tags")
    .eq("id", leadId)
    .eq("team_id", teamId)
    .single();

  if (leadError) {
    throw leadError;
  }

  const currentTags = lead.tags ?? [];

  if (!currentTags.includes(name)) {
    const { error } = await supabase
      .from("leads")
      .update({
        tags: [...currentTags, name],
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .eq("team_id", teamId);

    if (error) {
      throw error;
    }
  }

  return {
    id: name,
    name,
    color: color ?? "#6366f1",
  };
}

export async function removeLeadTag(tagId: string): Promise<void> {
  const { teamId } = await getWorkspaceTeam();
  const supabase = await createSupabaseServerClient();

  // In the live schema, the tag ID is represented by its name.
  const { data: leads, error: fetchError } = await supabase
    .from("leads")
    .select("id, tags")
    .eq("team_id", teamId)
    .contains("tags", [tagId]);

  if (fetchError) {
    throw fetchError;
  }

  for (const lead of leads ?? []) {
    const updatedTags = (lead.tags ?? []).filter(
      (tag: string) => tag !== tagId
    );

    const { error } = await supabase
      .from("leads")
      .update({
        tags: updatedTags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .eq("team_id", teamId);

    if (error) {
      throw error;
    }
  }
}

// ─── ACTIVITY ─────────────────────────────────────────────────

export async function getLeadActivities(
  leadId: string
): Promise<LeadActivity[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("lead_activities")
    .select(`
      id,
      lead_id,
      user_id,
      activity_type,
      description,
      metadata,
      created_at
    `)
    .eq("lead_id", leadId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []) as LeadActivity[];
}

async function logActivity(
  leadId: string,
  userId: string,
  activityType: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("lead_activities")
    .insert({
      lead_id: leadId,
      user_id: userId,
      activity_type: activityType,
      metadata,
    });

  if (error) {
    throw error;
  }
}