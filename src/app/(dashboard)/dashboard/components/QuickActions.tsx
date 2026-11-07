import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { href: "/leads/new", label: "Add lead" },
  { href: "/campaigns", label: "Open campaigns" },
  { href: "/settings/billing/subscription", label: "Manage billing" },
  { href: "/settings/profile", label: "Update profile" }
];

export function QuickActions() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button asChild key={action.href} variant="outline" size="sm">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
