"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { signInWithEmailPassword } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);

    try {
      const { data, error } = await signInWithEmailPassword(values);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Welcome back.");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      toast.success("Check your email to continue.");
      router.push("/verify-email");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Access your lead generation workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between text-sm">
            <a className="text-slate-600 hover:text-slate-950" href="/forgot-password">
              Forgot password?
            </a>
            <a className="text-slate-600 hover:text-slate-950" href="/signup">
              Need an account?
            </a>
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
