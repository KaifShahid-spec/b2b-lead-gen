"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UpdateProfileInput = {
    name: string;
};

export async function updateProfile(
    input: UpdateProfileInput
): Promise<{ ok: true } | { ok: false; error: string }> {
    const name = input.name?.trim();

    if (!name) {
        return { ok: false, error: "Name cannot be empty." };
    }

    if (name.length > 100) {
        return { ok: false, error: "Name must be 100 characters or fewer." };
    }

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { ok: false, error: "You must be signed in." };
    }

    const { error } = await supabase
        .from("users")
        .update({ name })
        .eq("id", user.id);

    if (error) {
        return { ok: false, error: error.message };
    }

    revalidatePath("/settings/profile");
    revalidatePath("/dashboard");

    return { ok: true };
}