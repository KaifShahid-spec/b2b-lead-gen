import { NextRequest, NextResponse } from "next/server";
import { updateLead, deleteLead, archiveLead, restoreLead } from "@/lib/leads/queries";

// PATCH /api/leads/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const lead = await updateLead(id, body);
    return NextResponse.json(lead);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/leads/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sp = request.nextUrl.searchParams;
    const action = sp.get("action"); // archive | restore | delete

    if (action === "archive") {
      const lead = await archiveLead(id);
      return NextResponse.json(lead);
    }
    if (action === "restore") {
      const lead = await restoreLead(id);
      return NextResponse.json(lead);
    }

    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
