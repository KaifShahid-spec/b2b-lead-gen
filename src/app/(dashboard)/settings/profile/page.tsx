import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Profile Settings | B2B Lead Gen",
  description: "Update your personal details.",
};

export default async function ProfileSettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
          { label: "Profile" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Update your personal information and account details.
        </p>
      </div>

      <ProfileForm
        initialName={profile?.name ?? ""}
        email={profile?.email ?? user.email ?? ""}
      />
    </main>
  );
}