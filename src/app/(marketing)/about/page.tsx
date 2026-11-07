import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "About | Lead Gen SaaS",
  description: "Find, enrich, and convert B2B leads faster.",
};

const features = [
  {
    icon: Target,
    title: "Targeted lead capture",
    description:
      "Import from CSV, capture from web forms, or pull via API. Every lead lands enriched and ready to work.",
  },
  {
    icon: Sparkles,
    title: "AI enrichment",
    description:
      "Automatic company data, contact details, and intent signals from providers like Apollo, Clearbit, and Hunter.",
  },
  {
    icon: BarChart3,
    title: "Scoring & prioritization",
    description:
      "AI scores every lead so your team focuses on the ones most likely to convert — not the loudest in the inbox.",
  },
  {
    icon: Zap,
    title: "Campaign automation",
    description:
      "Build multi-touch sequences, track engagement, and stop guessing which message lands.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Shared pipelines, role-based access, and activity logs so everyone sees the same picture.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "SOC 2-ready infrastructure, encrypted at rest and in transit, with granular access controls.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
          About us
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
          Building the tools modern sales teams actually want to use
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
          We got tired of stitching together six tools to run a pipeline. So we
          built one workspace that captures leads, enriches them, scores them,
          and helps your team close them.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <CardTitle className="mt-3">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Ready to build a better pipeline?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Start free. No credit card required. Upgrade when your team is ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}