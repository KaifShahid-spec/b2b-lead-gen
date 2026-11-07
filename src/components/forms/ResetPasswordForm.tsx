"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/schemas";
import { exchangeAuthCode, updatePassword } from "@/lib/auth/client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [isExchanging, setIsExchanging] = useState(Boolean(code));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!code) {
      setIsExchanging(false);
      return;
    }

    let mounted = true;

    async function exchange() {
      if (!code) {
        setIsExchanging(false);
        return;
      }

      const { error } = await exchangeAuthCode(code);

      if (!mounted) {
        return;
      }

      if (error) {
        toast.error(error.message);
        setIsExchanging(false);
        return;
      }

      setIsExchanging(false);
      toast.success("Reset link verified. Choose a new password.");
    }

    void exchange();

    return () => {
      mounted = false;
    };
  }, [code]);

  async function onSubmit(values: ResetPasswordInput) {
    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(values);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated.");
      router.replace("/dashboard");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isExchanging) {
    return (
      <Card className="mx-auto w-full max-w-md border-slate-200 shadow-sm">
        <CardContent className="flex justify-center py-12">
          <LoadingSpinner label="Verifying reset link" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
