import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog | Lead Gen SaaS",
  description: "Insights on B2B lead generation, enrichment, and sales ops.",
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
};

const POSTS: Post[] = [
  {
    slug: "why-lead-scoring-matters",
    title: "Why lead scoring matters more than ever in 2026",
    excerpt:
      "Manual prioritization doesn't scale. Here's how modern teams use AI scoring to focus on the leads that actually convert.",
    date: "2026-09-15",
    author: "Team",
  },
  {
    slug: "enrichment-without-burnout",
    title: "Lead enrichment without the burnout",
    excerpt:
      "Enrichment should run in the background, not on your reps' to-do list. A look at the pipeline architecture we use.",
    date: "2026-08-28",
    author: "Team",
  },
  {
    slug: "csv-imports-that-dont-suck",
    title: "CSV imports that don't suck",
    excerpt:
      "Most CRMs make importing leads painful. We built ours to be fast, forgiving, and predictable.",
    date: "2026-08-10",
    author: "Team",
  },
];

function formatDate(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default function BlogPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
          Blog
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
          Insights for modern sales teams
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
          Playbooks, product updates, and lessons from building a lead-gen platform.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="space-y-6">
          {POSTS.map((post) => (
            <Card key={post.slug} className="border-slate-200 transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
              <CardHeader>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {formatDate(post.date)} · {post.author}
                </p>
                <CardTitle>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/blog/${post.slug}`}>Read →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}