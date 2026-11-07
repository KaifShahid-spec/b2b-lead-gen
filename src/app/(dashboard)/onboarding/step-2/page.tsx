import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GoalForm } from "./GoalForm";

export const metadata = {
  title: "Your goal | Onboarding",
};

export default async function OnboardingStep2Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_goal")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <GoalForm
      initial={{
        onboarding_goal: profile?.onboarding_goal ?? "",
      }}
    />
  );
}