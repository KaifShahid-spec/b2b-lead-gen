"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LeadTag } from "@/types/lead";

const TAG_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

type Props = {
  leadId: string;
  initialTags: LeadTag[];
};

export function TagManager({ leadId, initialTags }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<LeadTag[]>(initialTags);
  const [input, setInput] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function addTag() {
    const name = input.trim();

    if (!name || tags.some((tag) => tag.name === name)) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${leadId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add tag");
      }

      const tag: LeadTag = await res.json();

      setTags([...tags, tag]);
      setInput("");
      router.refresh();
    } catch {
      toast.error("Could not add tag");
    } finally {
      setSaving(false);
    }
  }

  async function removeTag(tag: LeadTag) {
    setRemoving(tag.id);

    try {
      const res = await fetch(
        `/api/leads/${leadId}/tags?tagId=${tag.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setTags(tags.filter((item) => item.id !== tag.id));
      router.refresh();
    } catch {
      toast.error("Could not remove tag");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing tags */}
      <div className="flex min-h-[32px] flex-wrap gap-2">
        {tags.length === 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            No tags yet
          </span>
        )}

        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white transition-opacity"
            style={{
              backgroundColor: tag.color,
            }}
          >
            {tag.name}

            <button
              onClick={() => removeTag(tag)}
              disabled={removing === tag.id}
              className="ml-0.5 rounded-full transition-opacity hover:opacity-70"
              aria-label={`Remove tag ${tag.name}`}
            >
              {removing === tag.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          </span>
        ))}
      </div>

      {/* Add new tag */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {TAG_COLORS.map((tagColor) => (
            <button
              key={tagColor}
              onClick={() => setColor(tagColor)}
              className="h-5 w-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: tagColor,
                boxShadow:
                  color === tagColor
                    ? "0 0 0 2px white"
                    : "none",
                outline:
                  color === tagColor
                    ? `2px solid ${tagColor}`
                    : "none",
                outlineOffset: "1px",
              }}
              aria-label={`Color ${tagColor}`}
            />
          ))}
        </div>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="New tag…"
          className="h-8 flex-1 text-sm"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={addTag}
          disabled={saving || !input.trim()}
          className="h-8"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}