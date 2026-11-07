import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, CreditCard, ChevronRight } from "lucide-react";

const sections = [
  {
    href: "/settings/profile",
    title: "Profile",
    description: "Update your name, email, and personal details.",
    icon: User,
  },
  {
    href: "/settings/team",
    title: "Team",
    description: "Manage team members, roles, and invitations.",
    icon: Users,
  },
  {
    href: "/settings/billing",
    title: "Billing",
    description: "View your subscription, invoices, and payment methods.",
    icon: CreditCard,
  },
];

export const metadata = {
  title: "Settings | B2B Lead Gen",
  description: "Manage your account and workspace settings.",
};

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your account, team, and billing preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Card
            key={href}
            className="border-slate-200 transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="mt-3">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={href}>
                  Open
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}