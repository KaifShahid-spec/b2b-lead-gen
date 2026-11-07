import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { createLead } from "@/lib/leads/queries";
import type {
  CreateLeadInput,
  LeadStatus,
  LeadPriority,
  LeadSource,
} from "@/types/lead";

type CsvRow = Record<string, string>;

const VALID_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "archived",
];

const VALID_PRIORITIES: LeadPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const VALID_SOURCES: LeadSource[] = [
  "website",
  "referral",
  "linkedin",
  "cold_email",
  "inbound",
  "event",
  "partner",
  "other",
];

// POST /api/leads/import — multipart form-data with a "file" field
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await (file as File).text();

    const { data, errors } = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV parse error",
          details: errors,
        },
        { status: 422 }
      );
    }

    const results: {
      row: number;
      id?: string;
      error?: string;
    }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const companyName = row.company_name?.trim();

      if (!companyName) {
        results.push({
          row: i + 1,
          error: "company_name is required",
        });
        continue;
      }

      const statusValue = row.status?.trim() || "new";
      const priorityValue = row.priority?.trim() || "medium";
      const sourceValue = row.source?.trim();

      const status: LeadStatus = VALID_STATUSES.includes(
        statusValue as LeadStatus
      )
        ? (statusValue as LeadStatus)
        : "new";

      const priority: LeadPriority = VALID_PRIORITIES.includes(
        priorityValue as LeadPriority
      )
        ? (priorityValue as LeadPriority)
        : "medium";

      const source: LeadSource | undefined =
        sourceValue && VALID_SOURCES.includes(sourceValue as LeadSource)
          ? (sourceValue as LeadSource)
          : undefined;

      const aiScore = row.ai_score?.trim()
        ? Number(row.ai_score)
        : undefined;

      const aiConfidence = row.ai_confidence?.trim()
        ? Number(row.ai_confidence)
        : undefined;

      const engagementScore = row.engagement_score?.trim()
        ? Number(row.engagement_score)
        : undefined;

      const input: CreateLeadInput = {
        company_name: companyName,

        company_website: row.company_website?.trim() || undefined,
        company_industry: row.company_industry?.trim() || undefined,
        company_size: row.company_size?.trim() || undefined,
        company_linkedin_url:
          row.company_linkedin_url?.trim() || undefined,
        company_description:
          row.company_description?.trim() || undefined,

        contact_name: row.contact_name?.trim() || undefined,
        contact_email: row.contact_email?.trim() || undefined,
        contact_phone: row.contact_phone?.trim() || undefined,
        contact_title: row.contact_title?.trim() || undefined,
        contact_linkedin_url:
          row.contact_linkedin_url?.trim() || undefined,

        city: row.city?.trim() || undefined,
        state: row.state?.trim() || undefined,
        country: row.country?.trim() || undefined,
        postal_code: row.postal_code?.trim() || undefined,

        ai_score: Number.isFinite(aiScore) ? aiScore : undefined,
        ai_score_reason:
          row.ai_score_reason?.trim() || undefined,
        ai_confidence: Number.isFinite(aiConfidence)
          ? aiConfidence
          : undefined,

        status,
        priority,
        source,
        source_url: row.source_url?.trim() || undefined,

        engagement_score: Number.isFinite(engagementScore)
          ? engagementScore
          : undefined,

        last_contacted_at:
          row.last_contacted_at?.trim() || undefined,
        next_follow_up_at:
          row.next_follow_up_at?.trim() || undefined,

        tags: row.tags
          ? row.tags
            .split("|")
            .map((tag) => tag.trim())
            .filter(Boolean)
          : undefined,
      };

      try {
        const lead = await createLead(input);

        results.push({
          row: i + 1,
          id: lead.id,
        });
      } catch (err) {
        results.push({
          row: i + 1,
          error:
            err instanceof Error
              ? err.message
              : "Failed to create lead",
        });
      }
    }

    const succeeded = results.filter((result) => result.id).length;
    const failed = results.filter((result) => result.error).length;

    return NextResponse.json(
      {
        succeeded,
        failed,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}