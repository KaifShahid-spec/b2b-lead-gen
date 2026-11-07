import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignUpInput
} from "@/lib/auth/schemas";

export async function signInWithEmailPassword(input: LoginInput) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });
}

export async function signUpWithEmailPassword(input: SignUpInput, emailRedirectTo: string) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: input.fullName,
        company_name: input.companyName
      }
    }
  });
}

export async function requestPasswordReset(input: ForgotPasswordInput, redirectTo: string) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo
  });
}

export async function resendVerificationEmail(email: string, redirectTo: string) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });
}

export async function exchangeAuthCode(code: string) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.exchangeCodeForSession(code);
}

export async function updatePassword(input: ResetPasswordInput) {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.updateUser({
    password: input.password
  });
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.signOut();
}
