import { NextRequest, NextResponse } from "next/server";
import { addLeadTag, removeLeadTag } from "@/lib/leads/queries";

// POST /api/leads/[id]/tags
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, color } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Tag name required" }, { status: 400 });
    const tag = await addLeadTag(id, name.trim(), color);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/leads/[id]/tags?tagId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const tagId = request.nextUrl.searchParams.get("tagId");
    if (!tagId) return NextResponse.json({ error: "tagId required" }, { status: 400 });
    await removeLeadTag(tagId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
