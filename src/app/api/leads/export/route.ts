import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/lib/leads/queries";
import Papa from "papaparse";

// GET /api/leads/export — export leads as CSV
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const archived = sp.get("archived") === "true";

    const result = await getLeads({
      page: 1,
      pageSize: 10000,
      archived,
    });

    const rows = result.data.map((lead) => ({
      id: lead.id,

      company_name: lead.company_name ?? "",
      company_website: lead.company_website ?? "",
      company_industry: lead.company_industry ?? "",
      company_size: lead.company_size ?? "",
      company_linkedin_url: lead.company_linkedin_url ?? "",
      company_description: lead.company_description ?? "",

      contact_name: lead.contact_name ?? "",
      contact_email: lead.contact_email ?? "",
      contact_phone: lead.contact_phone ?? "",
      contact_title: lead.contact_title ?? "",
      contact_linkedin_url: lead.contact_linkedin_url ?? "",

      city: lead.city ?? "",
      state: lead.state ?? "",
      country: lead.country ?? "",
      postal_code: lead.postal_code ?? "",

      ai_score: lead.ai_score ?? "",
      ai_score_reason: lead.ai_score_reason ?? "",
      ai_confidence: lead.ai_confidence ?? "",

      status: lead.status,
      priority: lead.priority,
      source: lead.source ?? "",
      source_url: lead.source_url ?? "",

      engagement_score: lead.engagement_score ?? 0,
      is_archived: lead.is_archived,

      last_contacted_at: lead.last_contacted_at ?? "",
      next_follow_up_at: lead.next_follow_up_at ?? "",

      tags: lead.tags?.join("|") ?? "",

      created_at: lead.created_at,
      updated_at: lead.updated_at,
    }));

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}