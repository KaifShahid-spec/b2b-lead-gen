import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  body: string[];
};

const POSTS: Post[] = [
  {
    slug: "why-lead-scoring-matters",
    title: "Why lead scoring matters more than ever in 2026",
    excerpt: "Manual prioritization doesn't scale.",
    date: "2026-09-15",
    author: "Team",
    body: [
      "Sales teams still spend too much time on leads that were never going to convert. Manual prioritization works at 20 leads a week; it collapses at 200.",
      "AI lead scoring fixes this by ranking every lead the moment it enters your workspace. Scores update in real time as engagement signals come in — email opens, site visits, replies, meetings booked.",
      "The result: your reps work top-of-list, and every other lead gets nurtured automatically. No more guessing which inbound is worth a call.",
      "We built scoring into every plan. If you want to see it on your own leads, start free — no credit card required.",
    ],
  },
  {
    slug: "enrichment-without-burnout",
    title: "Lead enrichment without the burnout",
    excerpt: "Enrichment should run in the background.",
    date: "2026-08-28",
    author: "Team",
    body: [
      "Every sales team has the same story: a rep pastes a list of names into a tool, waits, copies the enriched data back. Repeat.",
      "The problem isn't enrichment itself — it's that enrichment is treated as a task instead of infrastructure. It should run when a lead is created, not when someone remembers to run it.",
      "Our pipeline enriches leads asynchronously. You import a CSV, walk away, and come back to company data, emails, phone numbers, and intent signals already populated.",
      "No chasing, no batch jobs to schedule, no back-and-forth with spreadsheets.",
    ],
  },
  {
    slug: "csv-imports-that-dont-suck",
    title: "CSV imports that don't suck",
    excerpt: "Most CRMs make importing leads painful.",
    date: "2026-08-10",
    author: "Team",
    body: [
      "CSV import is the first thing a new user does, and most CRMs make it awful. Column mapping is buried in modals. Errors surface one row at a time. Duplicates slip through.",
      "We rebuilt ours from scratch. Auto-detect columns by header name. Show every problem row before you commit. Dedupe on email and company + name.",
      "You get a preview of exactly what will be inserted — including what's being skipped — before anything touches your database.",
      "Predictable imports mean you spend your time working leads, not cleaning them up.",
    ],
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

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | Lead Gen SaaS Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/blog"
        className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        ← All posts
      </Link>

      <p className="mt-6 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {formatDate(post.date)} · {post.author}
      </p>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        {post.title}
      </h1>

      <div className="mt-10 space-y-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-lg font-medium text-slate-950 dark:text-slate-50">
          Ready to try it on your own leads?
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Start free — no credit card required.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}