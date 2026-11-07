"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  type Lead,
  type CreateLeadInput,
  type LeadStatus,
  type LeadPriority,
  type LeadSource,
} from "@/types/lead";

type Props = {
  lead?: Lead;
  onSuccess?: (lead: Lead) => void;
  onCancel?: () => void;
};

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  website: string;
  linkedin_url: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  source: LeadSource | "";
};

export function LeadForm({ lead, onSuccess, onCancel }: Props) {
  const router = useRouter();
  const isEdit = Boolean(lead);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(lead?.tags ?? []);
  const [saving, setSaving] = useState(false);

  const existingName = lead?.contact_name?.trim() ?? "";
  const nameParts = existingName.split(/\s+/).filter(Boolean);

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        first_name: nameParts[0] ?? "",
        last_name: nameParts.slice(1).join(" "),
        email: lead?.contact_email ?? "",
        phone: lead?.contact_phone ?? "",
        company: lead?.company_name ?? "",
        title: lead?.contact_title ?? "",
        website: lead?.company_website ?? "",
        linkedin_url: lead?.contact_linkedin_url ?? "",
        status: lead?.status ?? "new",
        priority: lead?.priority ?? "medium",
        score: lead?.ai_score ?? 0,
        source: lead?.source ?? "",
      },
    });

  function addTag() {
    const value = tagInput.trim();

    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }

    setTagInput("");
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);

    try {
      const contactName = [values.first_name, values.last_name]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

      const payload: CreateLeadInput = {
        contact_name: contactName || undefined,
        contact_email: values.email.trim() || undefined,
        contact_phone: values.phone.trim() || undefined,
        company_name: values.company.trim(),
        contact_title: values.title.trim() || undefined,
        company_website: values.website.trim() || undefined,
        contact_linkedin_url: values.linkedin_url.trim() || undefined,

        status: values.status,
        priority: values.priority,
        ai_score: Number(values.score),
        source: values.source || undefined,

        tags,
      };

      const url = isEdit
        ? `/api/leads/${lead!.id}`
        : "/api/leads";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Request failed" }));

        throw new Error(err.error ?? "Request failed");
      }

      const saved: Lead = await res.json();

      toast.success(isEdit ? "Lead updated" : "Lead created");

      onSuccess?.(saved);

      if (!onSuccess) {
        router.push(`/leads/${saved.id}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identity */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Contact Info
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            error={errors.first_name?.message}
          >
            <Input
              id="first_name"
              {...register("first_name")}
              placeholder="Jane"
            />
          </Field>

          <Field
            label="Last name"
            error={errors.last_name?.message}
          >
            <Input
              id="last_name"
              {...register("last_name")}
              placeholder="Smith"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="jane@acme.com"
            />
          </Field>

          <Field label="Phone" error={errors.phone?.message}>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+1 555 000 0000"
            />
          </Field>

          <Field
            label="Company"
            error={errors.company?.message}
          >
            <Input
              id="company"
              {...register("company")}
              placeholder="Acme Inc."
            />
          </Field>

          <Field
            label="Job title"
            error={errors.title?.message}
          >
            <Input
              id="title"
              {...register("title")}
              placeholder="VP of Sales"
            />
          </Field>

          <Field
            label="Website"
            error={errors.website?.message}
          >
            <Input
              id="website"
              {...register("website")}
              placeholder="https://acme.com"
            />
          </Field>

          <Field
            label="LinkedIn URL"
            error={errors.linkedin_url?.message}
          >
            <Input
              id="linkedin_url"
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
        </div>
      </fieldset>

      {/* Qualification */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Qualification
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Status">
            <SelectField {...register("status")}>
              {LEAD_STATUSES.filter(
                (s) => s !== "archived"
              ).map((s) => (
                <option
                  key={s}
                  value={s}
                  className="capitalize"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Priority">
            <SelectField {...register("priority")}>
              {LEAD_PRIORITIES.map((p) => (
                <option
                  key={p}
                  value={p}
                  className="capitalize"
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Source">
            <SelectField {...register("source")}>
              <option value="">— None —</option>

              {LEAD_SOURCES.map((s) => (
                <option
                  key={s}
                  value={s}
                  className="capitalize"
                >
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </SelectField>
          </Field>
        </div>

        <Field
          label="Score (0–100)"
          error={errors.score?.message}
        >
          <Input
            id="score"
            type="number"
            min={0}
            max={100}
            {...register("score", {
              min: 0,
              max: 100,
              valueAsNumber: true,
            })}
          />
        </Field>
      </fieldset>

      {/* Tags */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Tags
        </legend>

        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addTag}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              >
                {tag}

                <button
                  type="button"
                  onClick={() =>
                    setTags(tags.filter((t) => t !== tag))
                  }
                  className="ml-0.5 rounded-full hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={saving}>
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {isEdit ? "Save changes" : "Create lead"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-700 dark:text-slate-300">
        {label}
      </Label>

      {children}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
        "dark:focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}