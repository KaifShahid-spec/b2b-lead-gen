"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Trash2, Loader2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { LeadNote } from "@/types/lead";

type Props = {
  leadId: string;
  initialNotes: LeadNote[];
};

export function LeadNotes({ leadId, initialNotes }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<LeadNote[]>(initialNotes);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to save note");
      }

      const note: LeadNote = await res.json();

      setNotes([note, ...notes]);
      setContent("");
      textareaRef.current?.focus();
      router.refresh();
    } catch {
      toast.error("Could not save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeleting(noteId);

    try {
      const res = await fetch(
        `/api/leads/${leadId}/notes?noteId=${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setNotes(notes.filter((n) => n.id !== noteId));
      router.refresh();
    } catch {
      toast.error("Could not delete note");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.ctrlKey || e.metaKey)
            ) {
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Add a note… (Ctrl+Enter to submit)"
          rows={3}
          className={cn(
            "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
            "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300",
            "transition-all"
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={saving || !content.trim()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Add note
          </Button>
        </div>
      </form>

      {/* List */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <StickyNote className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No notes yet
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className={cn(
                "group relative rounded-lg border border-slate-100 bg-slate-50 p-3",
                "dark:border-slate-800 dark:bg-slate-800/50"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {note.content}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {note.user_id ? "User" : "Unknown"} ·{" "}
                  {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                  })}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                  disabled={deleting === note.id}
                  onClick={() => handleDelete(note.id)}
                >
                  {deleting === note.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}