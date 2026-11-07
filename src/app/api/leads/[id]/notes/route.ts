import { NextRequest, NextResponse } from "next/server";
import { createLeadNote, deleteLeadNote } from "@/lib/leads/queries";

// POST /api/leads/[id]/notes
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    const note = await createLeadNote(id, content.trim());
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/leads/[id]/notes?noteId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const noteId = request.nextUrl.searchParams.get("noteId");
    if (!noteId) return NextResponse.json({ error: "noteId required" }, { status: 400 });
    await deleteLeadNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
