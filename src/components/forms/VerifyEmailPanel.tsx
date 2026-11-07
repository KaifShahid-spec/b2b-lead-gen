"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { exchangeAuthCode, resendVerificationEmail } from "@/lib/auth/client";

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "verifying" | "ready" | "error">(
    code ? "verifying" : "idle"
  );
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!code) {
      setStatus("idle");
      return;
    }

    let mounted = true;

    async function verify() {
      const { error } = await exchangeAuthCode(code!);

      if (!mounted) {
        return;
      }

      if (error) {
        setStatus("error");
        toast.error(error.message);
        return;
      }

      setStatus("ready");
      toast.success("Email verified.");
      router.replace("/dashboard");
      router.refresh();
    }

    void verify();

    return () => {
      mounted = false;
    };
  }, [code, router]);

  async function handleResend() {
    if (!email) {
      toast.error("No email address was provided.");
      return;
    }

    setIsResending(true);

    try {
      const { error } = await resendVerificationEmail(email, `${window.location.origin}/verify-email`);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Verification email resent.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>Check your inbox for a secure verification link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "verifying" ? (
          <LoadingSpinner label="Verifying email" />
        ) : (
          <>
            <p className="text-sm leading-6 text-slate-600">
              Once verified, you will be redirected to onboarding automatically.
            </p>
            <div className="flex flex-col gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/login")}>
                Go to login
              </Button>
              {email ? (
                <Button type="button" variant="secondary" className="w-full" onClick={handleResend} disabled={isResending}>
                  {isResending ? "Resending..." : "Resend verification email"}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
