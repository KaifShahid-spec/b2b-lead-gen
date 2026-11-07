import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type SearchParams = {
  code?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // Supabase sends ?error=access_denied&error_code=otp_expired&error_description=...
  // when the reset link is expired or already used.
  const hasError = Boolean(sp.error || sp.error_code);

  if (hasError) {
    const description =
      sp.error_description?.replace(/\+/g, " ") ??
      "This password reset link is invalid or has expired.";

    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">
            Reset link expired
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Request a new link
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <ResetPasswordForm />
    </main>
  );
}