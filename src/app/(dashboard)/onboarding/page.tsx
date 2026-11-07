import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/app/(dashboard)/onboarding/actions";
import { requireWorkspace } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage() {
  const workspace = await requireWorkspace();

  if (workspace.profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16">
      <Card className="w-full border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Welcome to your workspace</CardTitle>
          <CardDescription>
            Your account, team, and free subscription have been prepared. Finish onboarding to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-950">1. Profile</p>
              <p className="mt-1 text-sm text-slate-600">Review your account details.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-950">2. Team</p>
              <p className="mt-1 text-sm text-slate-600">Your default team was created for you.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-950">3. Setup</p>
              <p className="mt-1 text-sm text-slate-600">Connect sources and import leads next.</p>
            </div>
          </div>
          <form action={completeOnboardingAction}>
            <Button type="submit">Finish onboarding</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
