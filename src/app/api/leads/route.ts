import { NextRequest, NextResponse } from "next/server";
import {
  getLeads,
  createLead,
  bulkDeleteLeads,
  bulkArchiveLeads,
  bulkRestoreLeads,
} from "@/lib/leads/queries";
import type { LeadsQueryParams } from "@/types/lead";
import Papa from "papaparse";
import { requireWorkspace } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/leads — paginated list
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: LeadsQueryParams = {
      page: sp.get("page") ? Number(sp.get("page")) : 1,
      pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : 25,
      search: sp.get("search") ?? undefined,
      status: (sp.get("status") as LeadsQueryParams["status"]) ?? undefined,
      priority: (sp.get("priority") as LeadsQueryParams["priority"]) ?? undefined,
      source: (sp.get("source") as LeadsQueryParams["source"]) ?? undefined,
      sortBy: (sp.get("sortBy") as LeadsQueryParams["sortBy"]) ?? "created_at",
      sortDir: (sp.get("sortDir") as "asc" | "desc") ?? "desc",
      archived: sp.get("archived") === "true",
      tags: sp.get("tags") ? sp.get("tags")!.split(",") : undefined,
    };

    const result = await getLeads(params);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/leads — create single OR handle bulk actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk action
    if (body._bulk) {
      const { action, ids } = body as { _bulk: true; action: string; ids: string[] };
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
      }
      if (action === "delete") await bulkDeleteLeads(ids);
      else if (action === "archive") await bulkArchiveLeads(ids);
      else if (action === "restore") await bulkRestoreLeads(ids);
      else return NextResponse.json({ error: "Unknown bulk action" }, { status: 400 });

      return NextResponse.json({ success: true, count: ids.length });
    }

    // Single create
    const lead = await createLead(body);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/leads/export  — CSV export (called via separate route segment)
// POST /api/leads/import  — CSV import (called via separate route segment)
