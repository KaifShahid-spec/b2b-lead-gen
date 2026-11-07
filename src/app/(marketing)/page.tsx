import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";

export const metadata = {
  title: "Lead Gen SaaS — Find, enrich, and convert B2B leads",
  description:
    "Capture, enrich, score, and convert B2B leads in one workspace. Built for modern sales teams.",
};

const features = [
  {
    icon: Target,
    title: "Targeted capture",
    description:
      "Import from CSV, capture from forms, or pull via API. Every lead lands enriched and ready to work.",
  },
  {
    icon: Sparkles,
    title: "AI enrichment",
    description:
      "Automatic company data, contact details, and intent signals — no manual lookups.",
  },
  {
    icon: BarChart3,
    title: "Lead scoring",
    description:
      "Every lead ranked the moment it arrives. Focus on the ones most likely to convert.",
  },
  {
    icon: Zap,
    title: "Campaign automation",
    description:
      "Multi-touch sequences, engagement tracking, and stop guessing which message lands.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Shared pipelines, role-based access, and activity logs so everyone sees the same picture.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-ready",
    description:
      "SOC 2-ready infrastructure, encrypted in transit and at rest, with granular access controls.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your sources",
    description:
      "Import a CSV, connect a form, or hit our API. Leads flow in automatically.",
  },
  {
    number: "02",
    title: "Enrich & score",
    description:
      "Every lead gets company data, contact info, and an AI score in seconds.",
  },
  {
    number: "03",
    title: "Convert & close",
    description:
      "Build sequences, track engagement, and hand qualified leads to your reps.",
  },
];

const trustedBy = [
  "Acme Corp",
  "Northwind",
  "Globex",
  "Initech",
  "Umbrella",
  "Stark Industries",
];

export default async function HomePage() {

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950" />

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Now with AI enrichment
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-6xl md:text-7xl">
            Find, enrich, and convert{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              B2B leads
            </span>{" "}
            in one workspace
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Stop stitching together six tools. Capture leads, enrich them with
            company data, score them with AI, and run outbound campaigns —
            without leaving the app.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No credit card required · Free forever plan · Cancel anytime
          </p>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Trusted by sales teams at
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {trustedBy.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center text-sm font-medium tracking-tight text-slate-400 dark:text-slate-600"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
            Everything you need
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
            Built for the whole pipeline
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            From first touch to closed deal — one platform, no duct tape.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800 dark:hover:shadow-emerald-950/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 transition group-hover:bg-emerald-600 dark:bg-emerald-900/40">
                <Icon className="h-5 w-5 text-emerald-700 transition group-hover:text-white dark:text-emerald-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
              How it works
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
              Three steps. Zero friction.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="font-[family-name:var(--font-display)] text-5xl font-semibold text-emerald-200 dark:text-emerald-900/60">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE STRIP ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-emerald-50/30 to-white p-10 dark:border-slate-800 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 md:grid-cols-3">
          <div className="text-center">
            <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950 dark:text-slate-50">
              10×
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Faster lead qualification
            </p>
          </div>
          <div className="text-center">
            <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950 dark:text-slate-50">
              80%
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Less manual enrichment
            </p>
          </div>
          <div className="text-center">
            <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950 dark:text-slate-50">
              3×
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              More replies from outreach
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-950 py-24 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ready to build a better pipeline?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Start free. No credit card. Upgrade when your team is ready.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/signup">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Free forever plan
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              No credit card required
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Cancel anytime
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}