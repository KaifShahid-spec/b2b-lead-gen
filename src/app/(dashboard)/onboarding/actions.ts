"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { completeOnboarding } from "@/lib/auth/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export async function completeOnboardingAction() {
  const user = await requireUser();
  await completeOnboarding(user.id);
  redirect("/dashboard");
}

async function setOnboardingStep(userId: string, step: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({ onboarding_step: step, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function saveCompanyStep(input: {
  company_name: string;
  website: string;
  industry: string;
  company_size: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireUser();

    const companySize = input.company_size?.trim();
    if (companySize && !ALLOWED_COMPANY_SIZES.includes(companySize as typeof ALLOWED_COMPANY_SIZES[number])) {
      return { ok: false, error: "Invalid company size." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("users")
      .update({
        company_name: input.company_name?.trim() || null,
        website: input.website?.trim() || null,
        industry: input.industry?.trim() || null,
        company_size: companySize || null,
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/onboarding");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed." };
  }
}

export async function saveGoalStep(input: {
  onboarding_goal: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireUser();

    const goal = input.onboarding_goal?.trim();
    if (!goal) return { ok: false, error: "Pick a goal." };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_goal: goal,
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/onboarding");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed." };
  }
}

export async function skipToStep(step: number) {
  const user = await requireUser();
  const safeStep = Math.min(Math.max(step, 1), 3);
  await setOnboardingStep(user.id, safeStep);
  revalidatePath("/onboarding");
  redirect(`/onboarding/step-${safeStep}`);
}

export async function finishOnboardingAction() {
  const user = await requireUser();
  await completeOnboarding(user.id);
  revalidatePath("/onboarding");
  redirect("/dashboard");
}

export async function finishAndImportAction() {
  const user = await requireUser();
  await completeOnboarding(user.id);
  revalidatePath("/onboarding");
  redirect("/leads");
}