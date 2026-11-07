import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinishPanel } from "./FinishPanel";

export const metadata = {
  title: "Ready to go | Onboarding",
};

export default async function OnboardingStep3Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("company_name, onboarding_goal")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <FinishPanel
      companyName={profile?.company_name ?? null}
      goal={profile?.onboarding_goal ?? null}
    />
  );
}