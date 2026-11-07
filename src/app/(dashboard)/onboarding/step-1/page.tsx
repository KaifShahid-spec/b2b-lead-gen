import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CompanyForm } from "./CompanyForm";

export const metadata = {
  title: "Company details | Onboarding",
};

export default async function OnboardingStep1Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("company_name, website, industry, company_size")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <CompanyForm
      initial={{
        company_name: profile?.company_name ?? "",
        website: profile?.website ?? "",
        industry: profile?.industry ?? "",
        company_size: profile?.company_size ?? "",
      }}
    />
  );
}