"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureWorkspaceFromAuthUser } from "@/lib/auth/workspace";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  fullName: z.string().min(1).optional(),
  companyName: z.string().min(1).optional()
});

export async function createWorkspaceAction(input: unknown) {
  const parsedInput = createWorkspaceSchema.parse(input);

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!user.email) {
    throw new Error("Authenticated user does not have an email address");
  }

  return ensureWorkspaceFromAuthUser({
    userId: user.id,
    email: user.email,
    fullName: parsedInput.fullName,
    companyName: parsedInput.companyName
  });
}