"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema, type SignUpInput } from "@/lib/auth/schemas";
import { signUpWithEmailPassword } from "@/lib/auth/client";
import { createWorkspaceAction } from "@/app/(auth)/signup/actions";

export function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpInput) {
    setIsSubmitting(true);

    try {
      const redirectBase = window.location.origin;

      const { data, error } = await signUpWithEmailPassword(
        values,
        `${redirectBase}/verify-email`
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      /*
       * A workspace can only be created through the authenticated
       * server action when a Supabase session exists.
       *
       * When email confirmation is enabled, Supabase may return
       * a user without a session. In that case, wait until the
       * user verifies their email and obtains a session.
       */
      if (data.session && data.user) {
        await createWorkspaceAction({
          fullName: values.fullName,
          companyName: values.companyName,
        });

        toast.success("Account created successfully.");

        router.replace("/onboarding");
        router.refresh();
        return;
      }

      toast.success(
        "Account created. Check your inbox to verify your email."
      );

      router.push(
        `/verify-email?email=${encodeURIComponent(values.email)}`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Create account</CardTitle>

        <CardDescription>
          Start your B2B lead gen workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>

            <Input
              id="fullName"
              autoComplete="name"
              {...form.register("fullName")}
            />

            {form.formState.errors.fullName ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company or team</Label>

            <Input
              id="companyName"
              autoComplete="organization"
              {...form.register("companyName")}
            />

            {form.formState.errors.companyName ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.companyName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />

            {form.formState.errors.email ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />

            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />

            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <a
              className="text-slate-600 hover:text-slate-950"
              href="/login"
            >
              Already have an account?
            </a>
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}