import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureWorkspaceFromAuthUser, getWorkspaceContext, getWorkspaceProfile }
  from "@/lib/auth/workspace";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { user: data.user };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireWorkspace() {
  const user = await requireUser();
  const workspace = await getWorkspaceProfile(user.id).catch(() => null);

  if (!workspace) {
    const authUser = user.user_metadata ?? {};
    await ensureWorkspaceFromAuthUser({
      userId: user.id,
      email: user.email ?? "",
      fullName: typeof authUser.full_name === "string" ? authUser.full_name : null,
      companyName: typeof authUser.company_name === "string" ? authUser.company_name : null
    });
  }

  return getWorkspaceContext(user.id);
}