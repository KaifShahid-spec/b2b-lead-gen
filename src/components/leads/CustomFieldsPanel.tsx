"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  leadId: string;
  initialFields: Record<string, unknown>;
};

export function CustomFieldsPanel({
  leadId,
  initialFields,
}: Props) {
  const router = useRouter();
  const [fields, setFields] =
    useState<Record<string, unknown>>(initialFields);
  const [saving, setSaving] = useState<string | null>(null);

  async function saveField(key: string, value: unknown) {
    setSaving(key);

    try {
      const updated = { ...fields };

      if (value === undefined) {
        delete updated[key];
      } else {
        updated[key] = value;
      }

      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_fields: updated,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save custom field");
      }

      setFields(updated);
      router.refresh();
    } catch {
      toast.error("Could not save field");
    } finally {
      setSaving(null);
    }
  }

  async function removeField(key: string) {
    await saveField(key, undefined);
  }

  const entries = Object.entries(fields);

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
          No custom fields set yet.
        </p>
      )}

      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-2 group"
        >
          <div className="flex-1 space-y-1">
            <Label className="text-xs capitalize text-slate-500">
              {key.replace(/_/g, " ")}
            </Label>

            <Input
              defaultValue={String(value ?? "")}
              onBlur={(e) => {
                if (
                  e.target.value !== String(value ?? "")
                ) {
                  saveField(key, e.target.value);
                }
              }}
              className="h-8 text-sm"
            />
          </div>

          {saving === key ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 mt-5" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 mt-5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeField(key)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      <AddCustomField
        onAdd={(key, value) => {
          const updated = {
            ...fields,
            [key]: value,
          };

          setFields(updated);
          saveField(key, value);
        }}
        existingKeys={Object.keys(fields)}
      />
    </div>
  );
}

function AddCustomField({
  onAdd,
  existingKeys,
}: {
  onAdd: (key: string, value: string) => void;
  existingKeys: string[];
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  function submit() {
    const normalizedKey = key
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    if (
      !normalizedKey ||
      existingKeys.includes(normalizedKey)
    ) {
      return;
    }

    onAdd(normalizedKey, value.trim());

    setKey("");
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Plus className="h-3.5 w-3.5" />
        Add custom field
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3",
        "bg-slate-50 dark:bg-slate-800/40"
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Field name</Label>

          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g. budget"
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Value</Label>

          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 50000"
            className="h-8 text-sm mt-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={submit}
          disabled={!key.trim()}
        >
          Add
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}